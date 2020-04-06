import { Controller, Get, Post, Body, UseGuards, Headers } from '@nestjs/common';
import { DeploymentService } from './project.services';
import { CreatePushMergePRDTO } from './dto/push-merge.pr.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateSSHConfigDto } from './dto/create-ssh-config.dto';
import { CreateProjectEnvDto } from './dto/create-project-env';
import { AuthGuard } from '../../common/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('deployment')
export class DeploymentController {
  constructor(
    private readonly service: DeploymentService,
  ) { }


  @Post('create-project')
  findAll(@Body() dto: CreateProjectDto, @Headers('user_id') userId: number) {
    return this.service.createProject(dto, userId);
  }

  @Post('push')
  pushMergePR(@Body() dto: CreatePushMergePRDTO) {
    return this.service.pushMergePR(dto);
  }

  @Post('create-ssh-config')
  addSSH(@Body() dto: CreateSSHConfigDto) {
    return this.service.createSSHConfig(dto);
  }

  @Post('create-project-env')
  createProjectEnv(@Body() dto: CreateProjectEnvDto) {
    return this.service.createProjectEnv(dto);
  }

}