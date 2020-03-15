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


@Entity('project')
export class ProjectEntity extends BaseEntity {
  @PrimaryGeneratedColumn() project_id: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: ''
  })
  name: string;

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

}