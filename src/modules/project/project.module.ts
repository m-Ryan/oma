import { Module } from '@nestjs/common';
import { ProjectService } from './project.services';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEntity } from './entities/project.entity';
import { ProjectEnvEntity } from './entities/project_env.entity';
import { ProjectMemberEntity } from './entities/project_member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProjectEntity,
      ProjectEnvEntity,
      ProjectMemberEntity
    ])
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectCModule { }
