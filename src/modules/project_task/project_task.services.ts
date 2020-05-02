import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';
import { SSHEntity, SSHType } from './entities/ssh.entity';
import { getNowTimeStamp, formatListResponse, getSkip } from '../../utils/util';
import { encrypt } from '../../utils/crypto';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  NotAcceptableException,
} from '@nestjs/common';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { CreateTaskDTO } from './dto/create-task.dto';
import { ProjectEntity } from '../project/entities/project.entity';
import {
  ProjectTaskEntity,
  ProjectTaskEntityStatus,
} from './entities/project_task.entity';
import { ProjectEnvironmentEntity } from '../project/entities/project_environment.entity';
import { UpdateTaskDTO } from './dto/update-task.dto';

@Injectable()
export class ProjectTaskService {
  constructor(
    @InjectRepository(SSHEntity) private readonly ssh: Repository<SSHEntity>,
    @InjectRepository(ProjectTaskEntity)
    private readonly pjt: Repository<ProjectTaskEntity>,
    @InjectRepository(ProjectEntity)
    private readonly pj: Repository<ProjectEntity>,
    @InjectRepository(ProjectEnvironmentEntity)
    private readonly pje: Repository<ProjectEnvironmentEntity>,
  ) {}

  async create(projectEnvId: number) {
    const environment = await this.pje.findOne({
      project_env_id: projectEnvId,
      deleted_at: 0,
    });

    if (!environment) {
      throw new NotFoundException('分支配置不存在');
    }

    const task = this.pjt.create();
    task.branch = environment.branch;
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
    return this.pjt.save(newTask);
  }

  async updateTask(taskId: number, dto: UpdateTaskDTO) {
    const task = await this.pjt.findOne({
      where: {
        deleted_at: 0,
        task_id: taskId,
      },
    });

    task.updated_at = getNowTimeStamp();
    task.status = ProjectTaskEntityStatus.SUCCESS;
    if (dto.errMsg) {
      task.err_msg = dto.errMsg;
      task.status = ProjectTaskEntityStatus.ERROR;
    }
    return this.pjt.save(task);
  }

  async getList(id: number, page: number, size: number) {
    const data = await this.pjt.findAndCount({
      where: {
        deleted_at: 0,
        project_id: id,
      },
      take: size,
      skip: getSkip(page, size),
      order: {
        created_at: 'DESC',
      },
    });

    return formatListResponse(data);
  }
}
