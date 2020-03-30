import { Injectable, NotAcceptableException } from '@nestjs/common';
import { ProjectSchedule } from 'src/src/deployment/ProjectSchedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectEntity } from './entities/project.entity';
import { Repository } from 'typeorm';
import { CreatePushMergePRDTO } from './dto/push-merge.pr.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectTaskEntity } from './entities/project_task.entity';
import { getNowTimeStamp, getRepositoryName } from 'src/src/utils/util';


@Injectable()
export class DeploymentService {

  constructor(
    private readonly ps: ProjectSchedule,
    @InjectRepository(ProjectEntity) private readonly pj: Repository<ProjectEntity>,
    @InjectRepository(ProjectTaskEntity) private readonly pt: Repository<ProjectTaskEntity>,
  ) {

  }

  async createProject(dto: CreateProjectDto) {
    const project = await this.pj.findOne({
      name: dto.name
    })
    if (project) {
      throw new NotAcceptableException('已有同名项目')
    }
    const newProject = this.pj.create();
    newProject.name = dto.name;
    newProject.repository_name = getRepositoryName(dto.git_path);
    newProject.git_path = dto.git_path;
    newProject.created_at = getNowTimeStamp();
    newProject.updated_at = getNowTimeStamp();
    await this.pj.save(newProject);
    return newProject;
  }

  async pushMergePR(dto: CreatePushMergePRDTO) {

    await this.ps.createTask(dto);

    return { message: 'success' }
  }

}