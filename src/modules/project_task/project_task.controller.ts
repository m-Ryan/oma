import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Headers,
  Query,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { ProjectTaskService } from './project_task.services';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CreateTaskDTO } from './dto/create-task.dto';
import { UpdateTaskDTO } from './dto/update-task.dto';
import { PlaybackDTO } from './dto/playback.dto';

// @UseGuards(AuthGuard)
@Controller('project-task')
export class ProjectTaskController {
  constructor(private readonly service: ProjectTaskService) {}

  @Get('list')
  getList(
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number,
    @Query('id') id: number,
  ) {
    return this.service.getList(id, page, size);
  }

  @Post('create')
  create(@Body() dto: { project_env_id: number }) {
    console.log(dto);
    return this.service.create(dto.project_env_id);
  }

  @Post('push')
  push(@Body() dto: CreateTaskDTO) {
    return this.service.push(dto);
  }

  @Post('playback')
  playback(@Query('task_id') taskId: number) {
    return this.service.playback(taskId);
  }

  @Post('release')
  release(@Query('task_id') taskId: number) {
    return this.service.release(taskId);
  }

  @Post('update')
  @UseGuards(AdminGuard)
  update(
    @Query('task_id', new ParseIntPipe()) taskId: number,
    @Body() dto: UpdateTaskDTO,
  ) {
    return this.service.update(taskId, dto);
  }
}
