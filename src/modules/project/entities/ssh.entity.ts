import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { ProjectTaskEntity } from './project_task.entity';

export enum SSHType {
  PWD = 1,
  PRIVATE_KEY = 2
}

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
    type: 'int',
    default: 22
  })
  port: number;

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
    type: 'tinyint',
    default: 0
  })
  type: SSHType;

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