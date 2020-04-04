import { Controller, Get, Post, Body, UsePipes } from '@nestjs/common';
import { UserService } from './user.services';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly service: UserService,
  ) { }

  @Post('create-user')
  createUser(@Body() dto: CreateUserDto) {
    return this.service.createUser(dto);
  }

}
