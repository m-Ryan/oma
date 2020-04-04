import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  ManyToOne,
  JoinColumn
} from 'typeorm';

import { ProjectEntity } from './project.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { ProjectGroupEntity } from './project_group.entity';

export enum GroupMemberRole {
  OWNER = 10,
  MEMBER = 5,
  USER = 1
}

@Entity('project_group_member')
export class ProjectGroupMemberEntity {
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
  group_id: number;

  @Column({
    type: 'tinyint',
    default: GroupMemberRole.USER
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

  @ManyToOne((type) => ProjectGroupEntity, (ProjectGroupEntity) => ProjectGroupEntity.group_id)
  @JoinColumn({ name: 'group_id' })
  group: ProjectGroupEntity;

}