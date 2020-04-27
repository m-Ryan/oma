import { Module } from '@nestjs/common';
import { ProjectService } from './project.services';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEntity } from './entities/project.entity';
import { ProjectEnvironmentEntity } from './entities/project_environment.entity';
import { ProjectMemberEntity } from './entities/project_member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProjectEntity,
      ProjectEnvironmentEntity,
      ProjectMemberEntity
    ])
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectCModule { }
