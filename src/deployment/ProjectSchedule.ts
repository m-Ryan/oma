import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { ProjectEntity } from "../modules/project/entities/project.entity";
import { Repository, Transaction } from "typeorm";
import { CreatePushMergePRDTO } from "../modules/project/dto/push-merge.pr.dto";
import { createBuildPipline } from "./ProjectTask";
import { ProjectTaskEntity, ProjectTaskEntityStatus } from "../modules/project/entities/project_task.entity";
import dayjs from 'dayjs';

@Injectable()
export class ProjectSchedule {
  private taskQueue: ProjectTaskEntity[] = [];
  private taskBuildQueue: ProjectTaskEntity[] = [];
  private maxLimit: number = 2;
  constructor(
    @InjectRepository(ProjectEntity) private readonly pj: Repository<ProjectEntity>,
    @InjectRepository(ProjectTaskEntity) private readonly pt: Repository<ProjectTaskEntity>,
    @InjectRepository(ProjectEntity) private readonly ps: Repository<ProjectEntity>,
  ) { }

  @Transaction()
  async createTask(dto: CreatePushMergePRDTO) {

    const project = await this.ps.findOne({
      name: dto.repository.name,
      deleted_at: 0
    });

    if (!project) {
      throw new Error('no project');
    }

    const newTask = this.pt.create();
    newTask.repository = dto.repository.name;
    newTask.branch = dto.ref.replace(/refs\/heads\/(\w+)/, '$1');
    newTask.commit = dto.commits[0].message;
    newTask.created_at = dayjs().unix();
    newTask.updated_at = dayjs().unix();
    newTask.project = project;
    this.pt.save(newTask);
    this.taskQueue.push(newTask);
  }

  beginTasks() {
    const tasks = this.taskQueue.splice(2, this.maxLimit - this.taskBuildQueue.length);
    if (tasks.length === 0) return;

    this.taskBuildQueue.push(...tasks);
    tasks.forEach(task => {
      createBuildPipline({
        task,
        onProgress: (logs) => {
          console.log(logs)
        },
        onSuccess: () => {
          this.onTaskOver({ task }).then(() => this.beginTasks());
        },
        onError: (errMsg) => {
          this.onTaskOver({ task, errMsg }).then(() => this.beginTasks());
        },
      });
    })

  }

  onTaskOver({ task, errMsg }: {
    task: ProjectTaskEntity,
    errMsg?: string
  }) {
    task.updated_at = dayjs().unix();
    task.status = ProjectTaskEntityStatus.SUCCESS;
    if (errMsg) {
      task.err_msg = errMsg;
      task.status = ProjectTaskEntityStatus.ERROR;
    }
    return this.pt.save(task);
  }

}