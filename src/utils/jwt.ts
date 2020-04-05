import jwt from 'jsonwebtoken';
import { UserEntity, UserRole } from '../modules/user/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';

const SALT_KEY = 'oma.maocanhua.cn';

export interface BaseUser {
  user_id: number;
  nickname: string;
  role: UserRole;
}
export function jwtSign(user: BaseUser) {
  return jwt.sign(user, SALT_KEY);
}

export function jwtVerify(token: string) {
  try {
    return jwt.verify(token, SALT_KEY) as BaseUser;
  } catch (error) {
    throw new UnauthorizedException('无效的token');
  }
}