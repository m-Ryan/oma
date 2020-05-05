import { IsString, IsNumber } from 'class-validator';
import {
  ProjectTaskEntityStatus,
  ProjectTaskEntityReleaseStatus,
} from '../entities/project_task.entity';

export class UpdateTaskDTO {
  @IsString()
  infomation: string;

  @IsNumber()
  status: ProjectTaskEntityStatus;

  @IsNumber()
  release_status: ProjectTaskEntityReleaseStatus;
}
