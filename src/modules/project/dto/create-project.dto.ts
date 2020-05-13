import {
  IsString,
  IsInt,
  IsNotEmpty,
  MinLength,
  ArrayNotEmpty,
} from 'class-validator';
import { CreateProjectEnvironmentDto } from './create-project-env';

export class CreateProjectDto {
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly git_path: string;

  @IsNotEmpty()
  @IsString()
  readonly upload_floder: string;

  @IsNotEmpty()
  @IsString()
  readonly upload_path: string;

  @IsString()
  readonly desc: string;

  @ArrayNotEmpty()
  readonly environments: Omit<CreateProjectEnvironmentDto, 'project_id'>[];
}
