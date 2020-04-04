import { IsString, IsInt } from 'class-validator';

export class CreateSSHConfigDto {
  @IsString()
  readonly name: string;
  @IsString()
  readonly host: string;
  @IsInt()
  readonly port: number;
  @IsString()
  readonly username: string;
  readonly password?: string;
  readonly privateKey?: string;
}
