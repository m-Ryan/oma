import {
  IsString,
  IsNotEmpty,
  MinLength,
  ArrayNotEmpty,
} from 'class-validator';
import { ProjectEnvironmentEntity } from '../entities/project_environment.entity';

export class UpdateProjectDto {
  @IsString()
  readonly name: string;
  @IsString()
  readonly git_path: string;

  @IsString()
  readonly upload_floder: string;

  @IsString()
  readonly desc: string;

  @ArrayNotEmpty()
  readonly environments: ProjectEnvironmentEntity[];
}
