import {
  Entity,
  Column,
  PrimaryGeneratedColumn
} from 'typeorm';


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
    default: ''
  })
  name: string;

  @Column({
    type: 'varchar',
    default: ''
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
  updated_at: number;

  @Column({
    type: 'int',
    default: 0
  })
  deleted_at: number;

}
