import { IsString, IsInt } from 'class-validator';
import { CreateProjectEnvDto } from './create-project-env';

export class CreateProjectDto {
  @IsString()
  readonly name: string;
  @IsString()
  readonly git_path: string;
  readonly envs: CreateProjectEnvDto[]
}

