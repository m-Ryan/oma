import { InjectRepository } from '@nestjs/typeorm';
import { ProjectEntity } from './entities/project.entity';
import { Repository, getManager } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectEnvironmentEntity } from './entities/project_environment.entity';
import {
  getNowTimeStamp,
  getRepositoryName,
  existsDir,
  formatListResponse,
  getSkip,
} from '../../utils/util';
import {
  NotAcceptableException,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { REPOSITORY_DIR, successResponse } from '../../constant';
import shelljs from 'shelljs';
import {
  ProjectMemberRole,
  ProjectMemberEntity,
} from './entities/project_member.entity';
import { CreateProjectEnvironmentDto } from './dto/create-project-env';
import { UpdateProjectDto } from './dto/update-project.dto';
import { runExec } from '../../utils/shell';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly pj: Repository<ProjectEntity>,
    @InjectRepository(ProjectEnvironmentEntity)
    private readonly pje: Repository<ProjectEnvironmentEntity>,
    @InjectRepository(ProjectMemberEntity)
    private readonly pjm: Repository<ProjectMemberEntity>,
  ) {}

  async create(dto: CreateProjectDto, userId: number) {
    return getManager().transaction(async transactionalEntityManager => {
      const project = await this.pj.findOne({
        git_path: dto.git_path,
        deleted_at: 0,
      });
      if (project) {
        throw new NotAcceptableException('该项目已存在，创建失败');
      }

      const repositoryName = getRepositoryName(dto.git_path);
      await runExec(`rm -rf ${repositoryName}`, {
        cwd: REPOSITORY_DIR,
      });
      await runExec(`git clone ${dto.git_path} ${repositoryName}`, {
        cwd: REPOSITORY_DIR,
      });
      if (!dto.environments.length) {
        throw new NotAcceptableException('至少要有一个部署环境');
      }
      const now = getNowTimeStamp();

      // crate project
      const newProject = transactionalEntityManager.create(ProjectEntity);
      newProject.user_id = userId;
      newProject.name = dto.name;
      newProject.desc = dto.desc;
      newProject.upload_floder = dto.upload_floder;
      newProject.upload_path = dto.upload_path;
      newProject.repository_name = repositoryName;
      newProject.git_path = dto.git_path;
      newProject.created_at = now;
      newProject.updated_at = now;
      await transactionalEntityManager.save(newProject);

      // create member
      const member = transactionalEntityManager.create(ProjectMemberEntity);
      member.role = ProjectMemberRole.OWNER;
      member.user_id = userId;
      member.created_at = now;
      member.updated_at = now;
      member.project_id = newProject.project_id;
      await transactionalEntityManager.save(member);
      newProject.members = [member];

      if (!Array.isArray(dto.environments)) {
        throw new BadRequestException('environments error');
      }

      const environments = await transactionalEntityManager.save(
        ProjectEnvironmentEntity,
        dto.environments.map(item => {
          const environment: any = {};
          environment.project_id = newProject.project_id;
          environment.user_id = userId;
          environment.name = item.name;
          environment.branch = item.branch;
          environment.variables = item.variables;
          environment.public_path = item.public_path;
          environment.ssh_id = item.ssh_id;
          environment.name = item.name;
          environment.created_at = now;
          environment.updated_at = now;
          environment.auto_deploy = item.auto_deploy;
          return environment;
        }),
      );

      newProject.environments = environments;
      // create environment
      return newProject;
    });
  }

  async update(projectId: number, dto: UpdateProjectDto, userId: number) {
    return getManager().transaction(async transactionalEntityManager => {
      const project = await transactionalEntityManager.findOne(ProjectEntity, {
        project_id: projectId,
        deleted_at: 0,
      });
      if (!project) {
        throw new NotAcceptableException('项目不存在');
      }

      if (!Array.isArray(dto.environments)) {
        throw new BadRequestException('environments error');
      }

      if (dto.name) project.name = dto.name;
      if (dto.desc) project.desc = dto.desc;
      if (dto.upload_floder) project.upload_floder = dto.upload_floder;
      if (dto.upload_path) project.upload_path = dto.upload_path;
      project.updated_user_id = userId;

      // 先全部删掉
      await transactionalEntityManager.update(
        ProjectEnvironmentEntity,
        {
          project_id: projectId,
        },
        {
          deleted_at: getNowTimeStamp(),
        },
      );

      dto.environments.forEach(item => {
        if (!item.project_env_id) {
          delete item.project_env_id;
        }
        item.deleted_at = 0;
        item.project_id = project.project_id;
      });

      await transactionalEntityManager.save(
        ProjectEnvironmentEntity,
        dto.environments,
      );

      await transactionalEntityManager.save(project);
    });
  }

  async remove(projectId: number, userId: number) {
    const project = await this.pj.findOne({
      project_id: projectId,
      deleted_at: 0,
    });
    if (!project) {
      throw new NotAcceptableException('项目不存在');
    }
    const gitPath = project.git_path;

    project.deleted_at = getNowTimeStamp();
    project.updated_user_id = userId;
    await this.pj.save(project);

    const repositoryName = getRepositoryName(gitPath);
    shelljs.exec(`cd ${REPOSITORY_DIR} && rm -rf ${gitPath} ${repositoryName}`);
    return successResponse;
  }

  async createProjectEnv(dto: CreateProjectEnvironmentDto, userId: number) {
    const now = getNowTimeStamp();
    const environment = this.pje.create();
    environment.project_id = dto.project_id;
    environment.user_id = userId;
    environment.name = dto.name;
    environment.branch = dto.branch;
    environment.variables = dto.variables;
    environment.ssh_id = dto.ssh_id;
    environment.name = dto.name;
    environment.created_at = now;
    environment.updated_at = now;
    environment.auto_deploy = dto.auto_deploy;
    await this.pje.save(environment);
    return successResponse;
  }

  async getProject(projectId: number) {
    const data = await this.pj.findOne({
      where: {
        deleted_at: 0,
        project_id: projectId,
      },
      relations: ['environments', 'members'],
    });
    if (!data) {
      throw new NotFoundException('项目不存在');
    }
    return data;
  }

  async getList(page: number, size: number, userId: number) {
    const data = await getManager()
      .createQueryBuilder(ProjectEntity, 'project')
      .leftJoin('project.members', 'members')
      .leftJoinAndSelect('project.environments', 'environments')
      .where('project.deleted_at = :deleted_at', { deleted_at: 0 })
      .andWhere('environments.deleted_at = :deleted_at', { deleted_at: 0 })
      .andWhere('members.user_id = :user_id', { user_id: userId })
      .orderBy({
        'project.created_at': 'DESC',
      })
      .take(size)
      .skip(getSkip(page, size))
      .getManyAndCount();
    return formatListResponse(data);
  }
}
