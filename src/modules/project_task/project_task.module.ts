import { Module } from '@nestjs/common';
import { ProjectTaskService } from './project_task.services';
import { ProjectTaskController } from './project_task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SSHEntity } from './entities/ssh.entity';
import { ProjectEntity } from '../project/entities/project.entity';
import { ProjectTaskEntity } from './entities/project_task.entity';
import { ProjectEnvironmentEntity } from '../project/entities/project_environment.entity';
import { ProjectSchedule } from '../../deployment/ProjectSchedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SSHEntity,
      ProjectEntity,
      ProjectTaskEntity,
      ProjectEnvironmentEntity,
    ]),
  ],
  controllers: [ProjectTaskController],
  providers: [ProjectTaskService, ProjectSchedule],
})
export class ProjectTaskModule {}
