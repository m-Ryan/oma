import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEntity } from './entities/project.entity';
import { ProjectEnvEntity } from './entities/project_env.entity';
import { ProjectTaskEntity } from './entities/project_task.entity';
import { SSHEntity } from './entities/ssh.entity';
import { ProjectSchedule } from '../../deployment/ProjectSchedule';
import { HookController } from './hook.controller';
import { HookService } from './hook.services';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProjectEntity,
      ProjectEnvEntity,
      ProjectTaskEntity,
      SSHEntity
    ])
  ],
  controllers: [HookController],
  providers: [HookService, ProjectSchedule],
})
export class HookModule { }
