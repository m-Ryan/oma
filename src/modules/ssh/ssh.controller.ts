import { Controller, Get, Post, Body, UseGuards, Headers, Query, ParseIntPipe, Param } from '@nestjs/common';
import { SSHService } from './ssh.services';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CreateSSHConfigDto } from './dto/create-ssh-config.dto';

@UseGuards(AuthGuard)
@Controller('ssh')
export class SSHController {
  constructor(
    private readonly service: SSHService,
  ) { }

  @Get('list')
  getSSHList(@Query('page', new ParseIntPipe()) page: number, @Query('size', new ParseIntPipe()) size: number) {
    return this.service.getList(page, size);
  }

  @Post('create')
  addSSH(
    @Body() dto: CreateSSHConfigDto,
    @Headers('user_id') userId: number
  ) {
    return this.service.create(dto, userId);
  }

  @Post('update')
  @UseGuards(AdminGuard)
  update(@Query('ssh_id', new ParseIntPipe()) sshId: number, @Body() dto: Partial<CreateSSHConfigDto>, @Headers('user_id') userId: number) {
    return this.service.update(sshId, dto, userId);
  }

  @Post('remove')
  @UseGuards(AdminGuard)
  getDeleteSSH(@Query('ssh_id', new ParseIntPipe()) sshId: number, @Headers('user_id') userId: number) {
    return this.service.remove(sshId, userId);
  }

}