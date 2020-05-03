import { IsString, IsNumber } from 'class-validator';
import { ProjectTaskEntityStatus } from '../entities/project_task.entity';

export class UpdateTaskDTO {
  @IsString()
  infomation: string;

  @IsNumber()
  status: ProjectTaskEntityStatus;
}
