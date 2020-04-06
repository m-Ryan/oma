import { InjectRepository } from '@nestjs/typeorm';
import { ProjectEntity } from './entities/project.entity';
import { Repository, getManager } from 'typeorm';
import { CreatePushMergePRDTO } from './dto/push-merge.pr.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectTaskEntity } from './entities/project_task.entity';
import { ProjectGroupEntity } from './entities/project_group.entity';
import { ProjectGroupMemberEntity, GroupMemberRole } from './entities/project_group_member.entity';
import { CreateSSHConfigDto } from './dto/create-ssh-config.dto';
import { SSHEntity, SSHType } from './entities/ssh.entity';
import { CreateProjectEnvDto } from './dto/create-project-env';
import { ProjectEnvEntity } from './entities/project_env.entity';
import { ProjectSchedule } from '../../deployment/ProjectSchedule';
import { getNowTimeStamp, getRepositoryName, existsDir } from '../../utils/util';
import { encrypt } from '../../utils/crypto';
import { NotAcceptableException, Injectable } from '@nestjs/common';
import fs from 'fs-extra';
import { runExec } from '../../utils/shell';

@Injectable()
export class DeploymentService {

  constructor(
    private readonly ps: ProjectSchedule,
    @InjectRepository(ProjectEntity) private readonly pj: Repository<ProjectEntity>,
    @InjectRepository(ProjectTaskEntity) private readonly pt: Repository<ProjectTaskEntity>,
    @InjectRepository(ProjectEnvEntity) private readonly pje: Repository<ProjectEnvEntity>,
    @InjectRepository(SSHEntity) private readonly ssh: Repository<SSHEntity>,
  ) {

  }

  async createProject(dto: CreateProjectDto) {
    const user_id = 1;
    return getManager().transaction(async transactionalEntityManager => {
      const project = await this.pj.findOne({
        git_path: dto.git_path
      })
      if (project) {
        throw new NotAcceptableException('该项目已存在，创建失败');
      }

      const repositoryName = getRepositoryName(dto.git_path);

      if (!(await existsDir(repositoryName))) {
        await runExec(`git clone ${project.git_path} ${repositoryName}`);
      } else {
        throw new NotAcceptableException('已有同名项目');
      }

      const now = getNowTimeStamp();
      // crate project
      const newProject = transactionalEntityManager.create(ProjectEntity);
      newProject.user_id = user_id;
      newProject.name = dto.name;
      newProject.repository_name = repositoryName;
      newProject.git_path = dto.git_path;
      newProject.created_at = now;
      newProject.updated_at = now;
      await transactionalEntityManager.save(newProject);

      // create group
      const group = transactionalEntityManager.create(ProjectGroupEntity);
      group.project_id = newProject.project_id;
      group.owner_id = user_id;
      group.created_at = now;
      group.updated_at = now;
      await transactionalEntityManager.save(group);

      // create member

      const member = transactionalEntityManager.create(ProjectGroupMemberEntity);
      member.role = GroupMemberRole.OWNER;
      member.user_id = user_id;
      member.created_at = now;
      member.updated_at = now;
      member.group_id = group.group_id;
      await transactionalEntityManager.save(member);
      newProject.group = group;
      group.members = [member];
      return newProject;
    });

  }

  async createProjectEnv(dto: CreateProjectEnvDto) {
    const now = getNowTimeStamp();
    const user_id = 1;
    const env = this.pje.create();
    env.project_id = dto.project_id;
    env.user_id = user_id;
    env.name = dto.name;
    env.branch = dto.branch;
    env.env_name = dto.env_name;
    env.public_path = dto.public_path;
    env.ssh_id = dto.ssh_id;
    env.name = dto.name;
    env.created_at = now;
    env.updated_at = now;
    return this.pje.save(env);
  }

  async createSSHConfig(dto: CreateSSHConfigDto) {
    const now = getNowTimeStamp();
    const user_id = 1;
    const ssh = this.ssh.create();
    ssh.user_id = user_id;
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

    return { message: 'success' }
  }

}