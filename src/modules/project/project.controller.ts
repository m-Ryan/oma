import { Controller, Get, Post, Body } from '@nestjs/common';
import { DeploymentService } from './project.services';

import payload from '../../github-hooks-palyload-master-example.json';
import { CreatePushMergePRDTO } from './dto/push-merge.pr.dto';
import { CreateProjectDto } from './dto/create-project.dto';

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

}