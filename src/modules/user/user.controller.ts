import { Controller, Get, Post, Body, UsePipes, UseGuards, Headers } from '@nestjs/common';
import { UserService } from './user.services';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly service: UserService,
  ) { }

  @Post('create-user')
  createUser(@Body() dto: CreateUserDto) {
    return this.service.createUser(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.service.login(dto);
  }

  @UseGuards(AuthGuard)
  @Get('info')
  getInfo(@Headers('user_id') userId: number) {
    return this.service.getInfo(userId);
  }

}
