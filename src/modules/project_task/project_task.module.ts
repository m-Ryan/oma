import { Module } from '@nestjs/common';
import { ProjectTaskService } from './project_task.services';
import { ProjectTaskController } from './project_task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SSHEntity } from './entities/ssh.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SSHEntity
    ])
  ],
  controllers: [ProjectTaskController],
  providers: [ProjectTaskService],
})
export class ProjectTaskModule { }
