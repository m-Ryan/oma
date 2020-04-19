import { InjectRepository } from '@nestjs/typeorm';
import { ProjectEntity } from './entities/project.entity';
import { Repository, getManager, createQueryBuilder, FindManyOptions, FindConditions } from 'typeorm';
import { CreatePushMergePRDTO } from './dto/push-merge.pr.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectTaskEntity } from './entities/project_task.entity';
import { CreateSSHConfigDto } from './dto/create-ssh-config.dto';
import { SSHEntity, SSHType } from './entities/ssh.entity';
import { CreateProjectEnvDto } from './dto/create-project-env';
import { ProjectEnvEntity } from './entities/project_env.entity';
import { ProjectSchedule } from '../../deployment/ProjectSchedule';
import { getNowTimeStamp, getRepositoryName, existsDir, formatListResponse, getSkip } from '../../utils/util';
import { encrypt } from '../../utils/crypto';
import { NotAcceptableException, Injectable } from '@nestjs/common';
import { REPOSITORY_DIR } from '../../constant';
import shelljs from 'shelljs';
import { ProjectMemberRole, ProjectMemberEntity } from './entities/project_member.entity';

@Injectable()
export class DeploymentService {

  constructor(
    private readonly ps: ProjectSchedule,
    @InjectRepository(ProjectEntity) private readonly pj: Repository<ProjectEntity>,
    @InjectRepository(ProjectTaskEntity) private readonly pjt: Repository<ProjectTaskEntity>,
    @InjectRepository(ProjectEnvEntity) private readonly pje: Repository<ProjectEnvEntity>,
    @InjectRepository(ProjectMemberEntity) private readonly pjm: Repository<ProjectMemberEntity>,
    @InjectRepository(SSHEntity) private readonly ssh: Repository<SSHEntity>,
  ) {

  }

  async createProject(dto: CreateProjectDto, userId: number) {
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

  async createSSHConfig(dto: CreateSSHConfigDto, userId: number) {
    const now = getNowTimeStamp();
    const ssh = this.ssh.create();
    ssh.user_id = userId;
    ssh.name = dto.name;
    ssh.username = dto.username;
    ssh.host = dto.host;
    ssh.port = dto.port;
    ssh.created_at = now;
    ssh.updated_at = now;
    if (dto.password) {
      ssh.password = encrypt(dto.password);
      ssh.type = SSHType.PWD;
    } else {
      ssh.privateKey = encrypt(dto.privateKey);
      ssh.type = SSHType.PRIVATE_KEY;
    }
    await this.ssh.save(ssh);
    return ssh;
  }

  async pushMergePR(dto: CreatePushMergePRDTO) {

    await this.ps.createTask(dto);

    return { message: 'success' };
  }

  async getList(page: number, size: number, userId: number) {
    const data = await getManager().createQueryBuilder(ProjectEntity, 'project')
      .leftJoin('project.members', 'members')
      .where("project.deleted_at = :deleted_at", { deleted_at: 0 })
      .andWhere("members.user_id = :user_id", { user_id: userId })
      .take(size)
      .skip(getSkip(page, size))
      .getManyAndCount();
    return formatListResponse(data);
  }

  async getHistoryList(page: number, size: number, userId: number, projectId?: number) {

    const condition: FindConditions<ProjectTaskEntity> = {
      deleted_at: 0,
    };
    if (projectId) {
      condition.project_id = projectId;
    }
    const data = await this.pjt.findAndCount({
      where: condition,
      take: size,
      skip: getSkip(page, size)
    });
    return formatListResponse(data);
  }

} 