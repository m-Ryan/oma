import { IsString } from 'class-validator';
export class LoginDto {
  @IsString()
  readonly nickname: string;
  @IsString()
  readonly password: string;
}
