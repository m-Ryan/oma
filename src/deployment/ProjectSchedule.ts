import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotAcceptableException } from '@nestjs/common';
import { ProjectEntity } from '../modules/project/entities/project.entity';
import { Repository, Transaction } from 'typeorm';
import { CreatePushMergePRDTO } from '../modules/project/dto/push-merge.pr.dto';
import { createBuildPipline } from './ProjectTask';
import {
  ProjectTaskEntity,
  ProjectTaskEntityStatus,
} from '../modules/project_task/entities/project_task.entity';
import dayjs from 'dayjs';
import { SSHEntity } from '../modules/ssh/entities/ssh.entity';
import { ProjectEnvEntity } from '../modules/project/entities/project_env.entity';

@Injectable()
export class ProjectSchedule {
  private taskQueue: ProjectTaskEntity[] = [];
  private taskBuildQueue: ProjectTaskEntity[] = [];
  private maxLimit: number = 2;
  constructor(
    @InjectRepository(ProjectEntity) private readonly pj: Repository<ProjectEntity>,
    @InjectRepository(ProjectEnvEntity) private readonly pje: Repository<ProjectEnvEntity>,
    @InjectRepository(ProjectTaskEntity) private readonly pt: Repository<ProjectTaskEntity>,
    @InjectRepository(SSHEntity) private readonly ssh: Repository<SSHEntity>,
  ) { }

  async createTask(dto: CreatePushMergePRDTO) {
    const branch = dto.ref.replace(/refs\/heads\/(\w+)/, '$1');
    const project = await this.pj.findOne({
      repository_name: dto.repository.name,
      deleted_at: 0,
    });

    if (!project) {
      throw new NotAcceptableException('该项目没有配置构建');
    }

    const env = await this.pje.findOne({
      where: {
        project_id: project.project_id,
        deleted_at: 0,
        branch
      },
      relations: ['ssh']
    });

    if (!env) {
      throw new NotAcceptableException('该分支没有配置构建');
    }

    const newTask = this.pt.create();
    newTask.repository = dto.repository.name;
    newTask.branch = branch;
    newTask.commit = dto.commits[0].message;
    newTask.version = dto.after;
    newTask.created_at = dayjs().unix();
    newTask.updated_at = dayjs().unix();
    newTask.project_env_id = env.project_env_id;
    newTask.project_env = env;
    newTask.project_id = project.project_id;
    await this.pt.save(newTask);
    newTask.project = project;
    this.taskQueue.push(newTask);
    this.beginTasks();
  }

  beginTasks() {
    const tasks = this.taskQueue.splice(
      0,
      this.maxLimit - this.taskBuildQueue.length,
    );
    if (tasks.length === 0) return;
    this.taskBuildQueue.push(...tasks);
    tasks.forEach(task => {
      createBuildPipline({
        task,
        onProgress: logs => {
          console.log(logs);
        },
        onSuccess: () => {
          this.onTaskOver({ task });
        },
        onError: errMsg => {
          this.onTaskOver({ task, errMsg });
        },
      });
    });
  }

  async onTaskOver({
    task,
    errMsg,
  }: {
    task: ProjectTaskEntity;
    errMsg?: string;
  }) {
    task.updated_at = dayjs().unix();
    task.status = ProjectTaskEntityStatus.SUCCESS;
    if (errMsg) {
      task.err_msg = errMsg;
      task.status = ProjectTaskEntityStatus.ERROR;
    }
    await this.pt.save(task);
    this.taskBuildQueue = this.taskBuildQueue.filter(item => item !== task);
    this.beginTasks();
  }
}
