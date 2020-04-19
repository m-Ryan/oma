import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProjectEnvEntity } from './project_env.entity';
import { ProjectEntity } from './project.entity';

export enum ProjectTaskEntityStatus {
  PENDING = 0,
  SUCCESS = 1,
  ERROR = 2,
  OVERWRITE = 3,
}

@Entity('project_task')
export class ProjectTaskEntity {
  @PrimaryGeneratedColumn() task_id: number;

  @Column({
    type: 'int',
  })
  project_env_id: number;

  @Column({
    type: 'int',
    default: 0
  })
  user_id: number;

  @Column({
    type: 'int',
    default: 0
  })
  project_id: number;

  @Column({
    type: 'int',
    default: 0
  })
  ssh_id: number;

  @Column({
    type: 'varchar',
    length: 255,
    default: '',
  })
  repository: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: '',
  })
  branch: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: '',
  })
  version: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: '',
  })
  commit: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: '',
  })
  err_msg: string;

  @Column({
    type: 'smallint',
    default: 0,
  })
  status: ProjectTaskEntityStatus;
  @Column({
    type: 'int',
    default: 0,
  })
  created_at: number;

  @Column({
    type: 'int',
    default: 0,
  })
  updated_at: number;

  @Column({
    type: 'int',
    default: 0,
  })
  deleted_at: number;

  @ManyToOne(
    type => ProjectEntity,
    ProjectEntity => ProjectEntity.project_id,
  )
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @ManyToOne(
    type => ProjectEnvEntity,
    ProjectEnvEntity => ProjectEnvEntity.project_env_id,
  )
  @JoinColumn({ name: 'project_env_id' })
  project_env: ProjectEnvEntity;

}
