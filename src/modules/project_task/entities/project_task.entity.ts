import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProjectEntity } from '../../project/entities/project.entity';
import { ProjectEnvironmentEntity } from '../../project/entities/project_environment.entity';

export enum ProjectTaskEntityStatus {
  PENDING = 1,
  DOING = 2,
  SUCCESS = 3,
  ERROR = 4,
  OVERWRITE = 5,
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
    default: 0,
  })
  user_id: number;

  @Column({
    type: 'int',
    default: 0,
  })
  project_id: number;

  @Column({
    type: 'int',
    default: 0,
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
    type: 'text',
  })
  infomation: string;

  @Column({
    type: 'smallint',
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
    type => ProjectEnvironmentEntity,
    ProjectEnvironmentEntity => ProjectEnvironmentEntity.project_env_id,
  )
  @JoinColumn({ name: 'project_env_id' })
  project_env: ProjectEnvironmentEntity;
}
