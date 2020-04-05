import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('user_password')
export class UserPasswordEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  user_id: number;
  @Column({
    type: 'varchar',
    length: 255,
    default: '',
  })
  password: string;

  @OneToOne(type => UserEntity, UserEntity => UserEntity.password)
  @JoinColumn({
    name: 'user_id',
  })
  user: UserEntity;

}
