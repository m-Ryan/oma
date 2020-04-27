import { IsString, IsInt } from 'class-validator';
import { CreateProjectEnvironmentDto } from './create-project-env';

export class CreateProjectDto {
  @IsString()
  readonly name: string;
  @IsString()
  readonly git_path: string;
  readonly environments: Omit<CreateProjectEnvironmentDto, 'project_id'>[];
}

