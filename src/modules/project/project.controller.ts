import { Controller, Get, Post, Body } from '@nestjs/common';
import { DeploymentService } from './project.services';
import { CreatePushMergePRDTO } from './dto/push-merge.pr.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateSSHConfigDto } from './dto/create-ssh-config.dto';
import { CreateProjectEnvDto } from './dto/create-project-env';

@Controller('deployment')
export class DeploymentController {
  constructor(
    private readonly service: DeploymentService,
  ) { }


  @Post('create-project')
  findAll(@Body() dto: CreateProjectDto) {
    return this.service.createProject(dto);
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