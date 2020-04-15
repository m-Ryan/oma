import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';
import { UserEntity, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserPasswordEntity } from './entities/user_password.entity';
import { encodePassword } from '../../utils/crypto';
import { jwtSign } from '../../utils/jwt';
import { LoginDto } from './dto/login.dto';


@Injectable()
export class UserService {

  constructor(
    @InjectRepository(UserEntity) private readonly user: Repository<UserEntity>,
  ) {

  }

  createUser(dto: CreateUserDto) {

    return getManager().transaction(async transactionalEntityManager => {
      const user = transactionalEntityManager.create(UserEntity);
      user.nickname = dto.nickname;
      user.token = '';
      user.role = UserRole.ADMIN;
      await transactionalEntityManager.save(user);

      user.token = jwtSign({
        user_id: user.user_id,
        nickname: user.nickname,
        role: user.role,
      });
      await transactionalEntityManager.save(user);

      const password = transactionalEntityManager.create(UserPasswordEntity);
      password.user_id = user.user_id;
      password.password = encodePassword(dto.password);
      await transactionalEntityManager.save(password);
      return user;
    });
  }

  async login(dto: LoginDto) {
    const user = await this.user.findOne({
      where: {
        nickname: dto.nickname,
        password: encodePassword(dto.password),
        deleted_at: 0
      }
    });

    if (!user) {
      throw new BadRequestException('用户名或密码错误');
    }

    user.token = jwtSign({
      user_id: user.user_id,
      nickname: user.nickname,
      role: user.role,
    });

    await this.user.save(user);

    return user;
  }

  async getInfo(userId: number) {
    const user = await this.user.findOne({
      where: {
        user_id: userId,
        deleted_at: 0
      }
    });

    if (!user) {
      throw new UnauthorizedException('登录信息过期');
    }

    return user;
  }

}
