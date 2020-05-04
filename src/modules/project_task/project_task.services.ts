import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager, FindConditions } from 'typeorm';
import path from 'path';
import { SSHEntity, SSHType } from './entities/ssh.entity';
import {
  getNowTimeStamp,
  formatListResponse,
  getSkip,
  getRepositoryName,
} from '../../utils/util';
import {
  Injectable,
  NotFoundException,
  NotAcceptableException,
} from '@nestjs/common';
import { CreateTaskDTO } from './dto/create-task.dto';
import { ProjectEntity } from '../project/entities/project.entity';
import {
  ProjectTaskEntity,
  ProjectTaskEntityStatus,
} from './entities/project_task.entity';
import { ProjectEnvironmentEntity } from '../project/entities/project_environment.entity';
import { UpdateTaskDTO } from './dto/update-task.dto';
import { REPOSITORY_DIR, successResponse } from '../../constant';
import { runExec } from '../../utils/shell';
import { ProjectSchedule } from '../../deployment/ProjectSchedule';
import { PlaybackDTO } from './dto/playback.dto';
import { ReleaseDto } from './dto/push.dto';
import { pushToServer } from '../../deployment/ProjectTask';

@Injectable({
  scope: 1,
})
export class ProjectTaskService {
  constructor(
    @InjectRepository(SSHEntity) private readonly ssh: Repository<SSHEntity>,
    @InjectRepository(ProjectTaskEntity)
    private readonly pjt: Repository<ProjectTaskEntity>,
    @InjectRepository(ProjectEntity)
    private readonly pj: Repository<ProjectEntity>,
    @InjectRepository(ProjectEnvironmentEntity)
    private readonly pje: Repository<ProjectEnvironmentEntity>,
    private readonly ps: ProjectSchedule,
  ) {
    this.ps = new ProjectSchedule(this);
  }

  async create(projectEnvId: number) {
    const environment = await this.pje.findOne({
      where: {
        project_env_id: projectEnvId,
        deleted_at: 0,
      },
      relations: ['project', 'ssh'],
    });

    if (!environment) {
      throw new NotFoundException('分支配置不存在');
    }

    if (environment.project.deleted_at > 0) {
      throw new NotFoundException('项目不存在');
    }

    const projectDir = getRepositoryName(environment.project.git_path);
    const repositoryPath = path.join(REPOSITORY_DIR, projectDir);
    const commit = await new Promise<{
      version: string;
      author: string;
      date: string;
      message: string;
    }>(async (resolve, reject) => {
      await runExec(`git checkout ${environment.branch}`, {
        cwd: repositoryPath,
      });
      return runExec(
        `git log -1 --date=iso --pretty=format:'{"version": "%h","author": "%aN <%aE>","date": "%ad","message": "%s"}' ${environment.branch} --`,
        {
          cwd: repositoryPath,
          onProgress: data => resolve(JSON.parse(data)),
          onEnd: () =>
            reject(
              new NotFoundException(
                `分支不存在， bad revision ${environment.branch}`,
              ),
            ),
          onError: err => reject(err),
        },
      );
    });
    const newTask = this.pjt.create();
    newTask.repository = environment.project.repository_name;
    newTask.branch = environment.branch;
    newTask.commit = commit.message;
    newTask.version = commit.version;
    newTask.status = ProjectTaskEntityStatus.PENDING;
    newTask.created_at = getNowTimeStamp();
    newTask.updated_at = getNowTimeStamp();
    newTask.project_env_id = environment.project_env_id;
    newTask.project_id = environment.project_id;
    newTask.infomation = '正在构建';
    await this.pjt.save(newTask);
    newTask.project_env = environment;
    this.ps.createTask(newTask);
    return newTask;
  }

  async playback(taskId: number) {
    const oldTask = await this.pjt.findOne({
      task_id: taskId,
      deleted_at: 0,
    });

    if (!oldTask) {
      throw new NotFoundException('回放任务不存在');
    }

    const environment = await this.pje.findOne({
      where: {
        project_env_id: oldTask.project_env_id,
        deleted_at: 0,
      },
      relations: ['project', 'ssh'],
    });

    if (!environment) {
      throw new NotFoundException('回放任务未配置环境');
    }

    const newTask = this.pjt.create();
    newTask.repository = oldTask.repository;
    newTask.branch = oldTask.branch;
    newTask.commit = oldTask.commit;
    newTask.version = oldTask.version;
    newTask.status = ProjectTaskEntityStatus.PENDING;
    newTask.created_at = getNowTimeStamp();
    newTask.updated_at = getNowTimeStamp();
    newTask.project_env_id = oldTask.project_env_id;
    newTask.project_id = oldTask.project_id;
    newTask.infomation = '正在构建';
    this.pjt.save(newTask);
    newTask.project_env = environment;
    this.ps.createTask(newTask);
    return newTask;
  }

  async release(taskId: number) {
    const task = await this.pjt.findOne({
      task_id: taskId,
      deleted_at: 0,
    });

    if (!task) {
      throw new NotFoundException('回放任务不存在');
    }

    if (task.status !== ProjectTaskEntityStatus.SUCCESS) {
      throw new NotAcceptableException('只有构建成功的版本才能发布');
    }

    const environment = await this.pje.findOne({
      where: {
        project_env_id: task.project_env_id,
        deleted_at: 0,
      },
      relations: ['project', 'ssh'],
    });

    if (!environment) {
      throw new NotFoundException('回放任务未配置环境');
    }

    task.project_env = environment;

    await pushToServer(task);
    return successResponse;
  }

  async push(dto: CreateTaskDTO) {
    const branch = dto.ref.replace(/refs\/heads\/(\w+)/, '$1');
    const project = await this.pj.findOne({
      repository_name: dto.repository.name,
      deleted_at: 0,
    });

    if (!project) {
      throw new NotFoundException('该项目没有配置构建');
    }

    const env = await this.pje.findOne({
      where: {
        project_id: project.project_id,
        deleted_at: 0,
        branch,
      },
      relations: ['ssh'],
    });

    if (!env) {
      throw new NotAcceptableException('该分支没有配置构建');
    }

    const newTask = this.pjt.create();
    newTask.repository = dto.repository.name;
    newTask.branch = branch;
    newTask.commit = dto.commits[0].message;
    newTask.version = dto.after;
    newTask.created_at = getNowTimeStamp();
    newTask.updated_at = getNowTimeStamp();
    newTask.project_env_id = env.project_env_id;
    newTask.project_env = env;
    newTask.project_id = project.project_id;
    newTask.infomation = '---';
    return this.pjt.save(newTask);
  }

  async update(taskId: number, dto: UpdateTaskDTO) {
    const task = await this.pjt.findOne({
      where: {
        deleted_at: 0,
        task_id: taskId,
      },
    });

    task.updated_at = getNowTimeStamp();
    task.status = dto.status;
    task.infomation = dto.infomation;
    return this.pjt.save(task);
  }

  async getList(id: number, page: number, size: number) {
    const condition: FindConditions<ProjectEntity> = {
      deleted_at: 0,
    };
    if (id) {
      condition.project_id = id;
    }
    const data = await this.pjt.findAndCount({
      where: condition,
      take: size,
      skip: getSkip(page, size),
      order: {
        created_at: 'DESC',
      },
    });

    return formatListResponse(data);
  }
}
