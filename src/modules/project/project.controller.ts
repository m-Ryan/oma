import { Controller, Get, Post, Body, UseGuards, Headers, Query, ParseIntPipe, Param } from '@nestjs/common';
import { DeploymentService } from './project.services';
import { CreatePushMergePRDTO } from './dto/push-merge.pr.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateSSHConfigDto } from './dto/create-ssh-config.dto';
import { CreateProjectEnvDto } from './dto/create-project-env';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@UseGuards(AuthGuard)
@Controller('project')
export class DeploymentController {
  constructor(
    private readonly service: DeploymentService,
  ) { }


  @Post('create')
  findAll(@Body() dto: CreateProjectDto, @Headers('user_id') userId: number) {
    return this.service.createProject(dto, userId);
  }

  @Post('push')
  pushMergePR(@Body() dto: CreatePushMergePRDTO) {
    return this.service.pushMergePR(dto);
  }

  @Post('create-ssh-config')
  addSSH(
    @Body() dto: CreateSSHConfigDto,
    @Headers('user_id') userId: number
  ) {
    return this.service.createSSHConfig(dto, userId);
  }

  @Post('create-project-env')
  createProjectEnv(
    @Body() dto: CreateProjectEnvDto,
    @Headers('user_id') userId: number
  ) {
    return this.service.createProjectEnv(dto, userId);
  }

  @Get('list')
  getList(@Query('page', new ParseIntPipe()) page: number, @Query('size', new ParseIntPipe()) size: number, @Headers('user_id') userId: number) {
    return this.service.getList(page, size, userId);
  }

  @Get('ssh-list')
  getSSHList(@Query('page', new ParseIntPipe()) page: number, @Query('size', new ParseIntPipe()) size: number) {
    return this.service.getSSHList(page, size);
  }

  @Post('delete-ssh')
  @UseGuards(AdminGuard)
  getDeleteSSH(@Query('ssh_id', new ParseIntPipe()) sshId: number, @Headers('user_id') userId: number) {
    return this.service.deleteSSH(sshId, userId);
  }

  @Get(':id/history')
  getHistory(
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number,
    @Param('id') id: string,
    @Headers('user_id') userId: number,
    @Query('project_id') projectId?: number,
  ) {
    return this.service.getHistoryList(page, size, userId, projectId);
  }

}