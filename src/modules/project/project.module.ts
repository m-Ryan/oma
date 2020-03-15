import { Module } from '@nestjs/common';
import { DeploymentService } from './project.services';
import { DeploymentController } from './project.controller';
import { ProjectSchedule } from 'src/src/deployment/schedule';

@Module({
  imports: [],
  controllers: [DeploymentController],
  providers: [DeploymentService, ProjectSchedule],
})
export class DeploymentCModule { }
