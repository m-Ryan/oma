import {
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { jwtVerify } from '../../utils/jwt';
import { Request, Response } from 'express';

@Injectable()
export class UserAuthorizeMiddleware implements NestMiddleware {

  use(req: Request, res: Response, next: Function) {
    const token = req.headers['authorization'];
    if (token) {
      try {
        const user = jwtVerify(token);
        req.headers.user_id = user.user_id.toString();
        req.headers.user_role = user.role.toString();
      } catch (error) { }
    }
    next();
  }

}
