import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';

import { ProjectEntity } from './project.entity';
import { ProjectTaskEntityStatus, ProjectTaskEntity } from '../../project_task/entities/project_task.entity';
import { SSHEntity } from '../../ssh/entities/ssh.entity';


@Entity('project_env')
export class ProjectEnvEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
  }) project_env_id: number;

  @Column({
    type: 'int',
    default: 0
  })
  project_id: number;

  @Column({
    type: 'varchar',

    default: ''
  })
  name: string;

  @Column({
    type: 'int',
    default: 0
  })
  user_id: number;

  @Column({
    type: 'int',
    default: 0
  })
  ssh_id: number;

  @Column({
    type: 'tinyint',
    default: 0
  })
  auto_deploy: number;

  @Column({
    type: 'varchar',
    length: 255,
    default: ''
  })
  public_path: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: ''
  })
  env_name: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: ''
  })
  branch: string;

  @Column({
    type: 'int',
    default: 0
  })
  created_at: number;


  @Column({
    type: 'int',
    default: 0
  })
  updated_at: number;

  @Column({
    type: 'int',
    default: 0
  })
  deleted_at: number;

  @OneToMany((type) => ProjectTaskEntity, (ProjectTaskEntity) => ProjectTaskEntity.project_env)
  tasks: ProjectTaskEntityStatus[];

  @ManyToOne((type) => ProjectEntity, (ProjectEntity) => ProjectEntity.envs)
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @ManyToOne((type) => SSHEntity, (SSHEntity) => SSHEntity.ssh_id)
  @JoinColumn({ name: 'ssh_id' })
  ssh: SSHEntity;

}
