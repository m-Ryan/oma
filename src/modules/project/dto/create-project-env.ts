import { IsString, IsInt, } from 'class-validator';

export class CreateProjectEnvDto {

  @IsInt()
  readonly project_id: number;
  @IsString()
  readonly name: string;
  @IsString()
  readonly public_path: string;
  @IsString()
  readonly env_name: string;
  @IsString()
  readonly branch: string;
  @IsInt()
  readonly ssh_id: number;
  @IsInt()
  readonly auto_deploy: number;
}
