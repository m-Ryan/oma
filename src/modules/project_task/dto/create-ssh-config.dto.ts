import { IsString, IsInt } from 'class-validator';
import { SSHType } from '../entities/ssh.entity';

export class CreateSSHConfigDto {
  @IsString()
  readonly name: string;
  @IsString()
  readonly host: string;
  readonly port: number;
  @IsString()
  readonly username: string;
  readonly password?: string;
  readonly privateKey?: string;
  @IsInt()
  readonly type: SSHType;
}
