import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  ManyToOne,
  JoinColumn
} from 'typeorm';

import { UserEntity } from '../../user/entities/user.entity';
import { ProjectEntity } from './project.entity';
export enum ProjectMemberRole {
  OWNER = 10,
  MEMBER = 5,
  USER = 1
}

@Entity('project_member')
export class ProjectMemberEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
  }) member_id: number;

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
    type: 'tinyint',
    default: ProjectMemberRole.USER
  })
  role: number;

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

  @OneToOne((type) => UserEntity, (UserEntity) => UserEntity.user_id)
  user: UserEntity;

  @ManyToOne((type) => ProjectEntity, (ProjectEntity) => ProjectEntity.members)
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

}