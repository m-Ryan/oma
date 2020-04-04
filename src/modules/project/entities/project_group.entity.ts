import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne
} from 'typeorm';

import { ProjectEntity } from './project.entity';
import { ProjectGroupMemberEntity } from './project_group_member.entity';


@Entity('project_group')
export class ProjectGroupEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
  }) group_id: number;

  @Column({
    type: 'int',
    default: 0
  })
  project_id: number;

  @Column({
    type: 'int',
    default: 0
  })
  owner_id: number;

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
  updated_at: number;

  @Column({
    type: 'int',
    default: 0
  })
  deleted_at: number;

  @OneToOne((type) => ProjectEntity, (ProjectEntity) => ProjectEntity.group)
  project: ProjectEntity;

  @OneToMany((type) => ProjectGroupMemberEntity, (ProjectGroupMemberEntity) => ProjectGroupMemberEntity.group)
  members: ProjectGroupMemberEntity[];

}