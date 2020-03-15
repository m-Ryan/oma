import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne
} from 'typeorm';

import { ProjectEntity } from './project.entity';


@Entity('project')
export class ProjectEnvEntity extends BaseEntity {
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
  public_path: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: ''
  })
  env_name: string;

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

  @ManyToOne((type) => ProjectEntity, (ProjectEntity) => ProjectEntity.list)
  project: ProjectEntity;
}