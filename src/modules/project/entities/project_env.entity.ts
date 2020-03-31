import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  OneToOne
} from 'typeorm';

import { ProjectEntity } from './project.entity';
import { SSHEntity } from './ssh.entity';


@Entity('project_env')
export class ProjectEnvEntity {
  @PrimaryGeneratedColumn() project_id: number;

  @Column({
    type: 'varchar',

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

  @ManyToOne((type) => SSHEntity, (SSHEntity) => SSHEntity.ssh_id)
  ssh: SSHEntity;

}
