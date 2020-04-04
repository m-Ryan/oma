import { Injectable } from '@nestjs/common';
import { ProjectSchedule } from 'src/src/deployment/ProjectSchedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { encodePassword } from 'src/src/utils/crypto';


@Injectable()
export class UserService {

  constructor(
    @InjectRepository(UserEntity) private readonly user: Repository<UserEntity>,
  ) {

  }

  createUser(dto: CreateUserDto) {
    const user = this.user.create();
    user.name = dto.name;
    user.password = encodePassword(dto.password);
    return this.user.save(user);
  }

}
