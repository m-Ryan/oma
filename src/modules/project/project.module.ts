import { Module } from '@nestjs/common';
import { DeploymentService } from './project.services';
import { DeploymentController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEntity } from './entities/project.entity';
import { ProjectEnvEntity } from './entities/project_env.entity';
import { ProjectTaskEntity } from './entities/project_task.entity';
import { ProjectSchedule } from '../../deployment/ProjectSchedule';
import { SSHEntity } from './entities/ssh.entity';
import { ProjectMemberEntity } from './entities/project_member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProjectEntity,
      ProjectEnvEntity,
      ProjectTaskEntity,
      ProjectMemberEntity,
      SSHEntity
    ])
  ],
  controllers: [DeploymentController],
  providers: [DeploymentService, ProjectSchedule],
})
export class DeploymentCModule { }
