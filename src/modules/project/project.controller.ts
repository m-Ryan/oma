import { Controller, Get } from '@nestjs/common';
import { DeploymentService } from './project.services';

@Controller('deployment')
export class DeploymentController {
  constructor(private readonly service: DeploymentService) { }


  @Get('push')
  findAll() {
    return this.service.commitPush();
  }


}