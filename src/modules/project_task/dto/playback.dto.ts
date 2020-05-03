import { IsInt } from 'class-validator';

export class PlaybackDTO {
  @IsInt()
  readonly task_id: number;
}
