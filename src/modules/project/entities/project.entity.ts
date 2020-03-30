import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  getConnection,
  OneToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';

import { ProjectEnvEntity } from './project_env.entity';
import { ProjectTaskEntity } from './project_task.entity';


@Entity('project')
export class ProjectEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
  }) project_id: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: ''
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: ''
  })
  repository_name: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: ''
  })
  git_path: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: ''
  })
  desc: string;

  @Column({
    type: 'int',
    default: 0
  })
  created_at: number;

  @Column({
    type: 'int',
    default: 0
  })
  user_id: number;

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

  @OneToMany((type) => ProjectEnvEntity, (ProjectEnvEntity) => ProjectEnvEntity.project)
  list: ProjectEnvEntity[];

  @OneToMany((type) => ProjectTaskEntity, (ProjectTaskEntity) => ProjectTaskEntity.project)
  tasks: ProjectTaskEntity[];

}