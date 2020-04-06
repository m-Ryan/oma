import { InjectRepository } from '@nestjs/typeorm';
import { ProjectEntity } from './entities/project.entity';
import { Repository, getManager } from 'typeorm';
import { CreatePushMergePRDTO } from './dto/push-merge.pr.dto';
import { ProjectTaskEntity } from './entities/project_task.entity';
import { SSHEntity, SSHType } from './entities/ssh.entity';
import { ProjectEnvEntity } from './entities/project_env.entity';
import { ProjectSchedule } from '../../deployment/ProjectSchedule';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HookService {

  constructor(
    private readonly ps: ProjectSchedule,
    @InjectRepository(ProjectEntity) private readonly pj: Repository<ProjectEntity>,
    @InjectRepository(ProjectTaskEntity) private readonly pt: Repository<ProjectTaskEntity>,
    @InjectRepository(ProjectEnvEntity) private readonly pje: Repository<ProjectEnvEntity>,
    @InjectRepository(SSHEntity) private readonly ssh: Repository<SSHEntity>,
  ) {

  }

  async pushMergePR(dto: CreatePushMergePRDTO) {

    await this.ps.createTask(dto);

    return { message: 'success' }
  }

}