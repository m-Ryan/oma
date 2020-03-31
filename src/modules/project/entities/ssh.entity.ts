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

@Entity('ssh')
export class SSHEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
  }) ssh_id: number;

  @Column({
    type: 'varchar',
    default: ''
  })
  name: string;

  @Column({
    type: 'varchar',
    default: ''
  })
  host: string;

  @Column({
    type: 'tinyint',
    default: 22
  })
  port: string;

  @Column({
    type: 'varchar',
    default: ''
  })
  username: string;

  @Column({
    type: 'varchar',
    default: ''
  })
  password: string;

  @Column({
    type: 'varchar',
    default: ''
  })
  privateKey: string;

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

}