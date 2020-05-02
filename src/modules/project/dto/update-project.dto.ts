import { IsString } from 'class-validator';
import { ProjectEnvironmentEntity } from '../entities/project_environment.entity';

export class UpdateProjectDto {
  @IsString()
  readonly name: string;
  @IsString()
  readonly git_path: string;
  readonly environments: ProjectEnvironmentEntity;
}
