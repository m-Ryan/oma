import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne
} from 'typeorm';
import { UserPasswordEntity } from './user_password.entity';


export enum UserRole {
  ADMIN = 10,
  MEMBER = 5,
  USER = 1
}

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
  }) user_id: number;

  @Column({
    type: 'varchar',
  })
  nickname: string;

  @Column({
    type: 'varchar',
    default: 'http://assets.maocanhua.cn/FlYNsz6pq2voMT4z0citFEuFa-lc'
  })
  avatar: string;

  @Column({
    type: 'tinyint',
    default: UserRole.USER
  })
  role: number;

  @Column({
    type: 'varchar',
    default: ''
  })
  token: string;

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

  @OneToOne((type) => UserPasswordEntity, (UserPasswordEntity) => UserPasswordEntity.user)
  password: UserPasswordEntity;

}
