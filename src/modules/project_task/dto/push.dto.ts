import { IsInt } from 'class-validator';

export class ReleaseDto {
  @IsInt()
  readonly task_id: number;
}
