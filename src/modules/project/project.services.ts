import { InjectRepository } from '@nestjs/typeorm';
import { ProjectEntity } from './entities/project.entity';
import { Repository, getManager, createQueryBuilder, FindManyOptions } from 'typeorm';
import { CreatePushMergePRDTO } from './dto/push-merge.pr.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateProjectEnvDto } from './dto/create-project-env';
import { ProjectEnvEntity } from './entities/project_env.entity';
import { ProjectSchedule } from '../../deployment/ProjectSchedule';
import { getNowTimeStamp, getRepositoryName, existsDir, formatListResponse, getSkip } from '../../utils/util';
import { encrypt } from '../../utils/crypto';
import { NotAcceptableException, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { REPOSITORY_DIR } from '../../constant';
import shelljs from 'shelljs';
import { ProjectMemberRole, ProjectMemberEntity } from './entities/project_member.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class ProjectService {

  constructor(
    @InjectRepository(ProjectEntity) private readonly pj: Repository<ProjectEntity>,
    @InjectRepository(ProjectEnvEntity) private readonly pje: Repository<ProjectEnvEntity>,
    @InjectRepository(ProjectMemberEntity) private readonly pjm: Repository<ProjectMemberEntity>,
  ) {

  }

  async create(dto: CreateProjectDto, userId: number) {
    return getManager().transaction(async transactionalEntityManager => {
      const project = await this.pj.findOne({
        git_path: dto.git_path
      });
      if (project) {
        throw new NotAcceptableException('该项目已存在，创建失败');
      }

      const repositoryName = getRepositoryName(dto.git_path);
      if (!(await existsDir(repositoryName))) {
        shelljs.exec(`cd ${REPOSITORY_DIR} && git clone ${dto.git_path} ${repositoryName}`);
      } else {
        throw new NotAcceptableException('已有同名项目');
      }
      const now = getNowTimeStamp();
      // crate project
      const newProject = transactionalEntityManager.create(ProjectEntity);
      newProject.user_id = userId;
      newProject.name = dto.name;
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
      return newProject;
    });

  }

  async update(projectId: number, dto: CreateProjectDto, userId: number) {

    return getManager().transaction(async transactionalEntityManager => {
      const project = await this.pj.findOne({
        project_id: projectId,
        deleted_at: 0
      });
      if (project) {
        throw new NotAcceptableException('项目不存在');
      }

      if (dto.name) project.name = dto.name;

      await transactionalEntityManager.save(project);
    });

  }

  async createProjectEnv(dto: CreateProjectEnvDto, userId: number) {
    const now = getNowTimeStamp();
    const env = this.pje.create();
    env.project_id = dto.project_id;
    env.user_id = userId;
    env.name = dto.name;
    env.branch = dto.branch;
    env.env_name = dto.env_name;
    env.public_path = dto.public_path;
    env.ssh_id = dto.ssh_id;
    env.name = dto.name;
    env.created_at = now;
    env.updated_at = now;
    env.auto_deploy = dto.auto_deploy;
    return this.pje.save(env);
  }

  // async pushMergePR(dto: CreatePushMergePRDTO) {

  //   await this.ps.createTask(dto);

  //   return { message: 'success' };
  // }

  async getList(page: number, size: number, userId: number) {
    const data = await getManager().createQueryBuilder(ProjectEntity, 'project')
      .leftJoin('project.members', 'members')
      .leftJoinAndSelect('project.envs', 'envs')
      .where("project.deleted_at = :deleted_at", { deleted_at: 0 })
      .andWhere("members.user_id = :user_id", { user_id: userId })
      .take(size)
      .skip(getSkip(page, size))
      .getManyAndCount();
    return formatListResponse(data);
  }

  // async getHistoryList(page: number, size: number, userId: number, projectId?: number) {

  //   const condition: QueryDeepPartialEntity<ProjectTaskEntity> = {
  //     deleted_at: 0,
  //   };
  //   if (projectId) {
  //     condition.project_id = projectId;
  //   }
  //   const data = await this.pjt.findAndCount({
  //     where: condition,
  //     take: size,
  //     skip: getSkip(page, size)
  //   });
  //   return formatListResponse(data);
  // }

  // //ssh

  // async getSSHList(page: number, size: number) {

  //   const condition: QueryDeepPartialEntity<ProjectTaskEntity> = {
  //     deleted_at: 0,
  //   };

  //   const data = await this.ssh.findAndCount({
  //     where: condition,
  //     take: size,
  //     skip: getSkip(page, size)
  //   });
  //   return formatListResponse(data);
  // }


}
