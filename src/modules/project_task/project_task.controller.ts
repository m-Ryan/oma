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

// @UseGuards(AuthGuard)
@Controller('project-task')
export class ProjectTaskController {
  constructor(private readonly service: ProjectTaskService) {}

  @Get('list')
  getList(
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number,
    @Query('id', new ParseIntPipe()) id: number,
  ) {
    return this.service.getList(id, page, size);
  }

  @Post('create')
  create(@Body() project_env_id: number) {
    return this.service.create(project_env_id);
  }

  @Post('push')
  push(@Body() dto: CreateTaskDTO) {
    return this.service.push(dto);
  }

  // @Post('update')
  // @UseGuards(AdminGuard)
  // update(@Query('ssh_id', new ParseIntPipe()) sshId: number, @Body() dto: Partial<CreateDeployConfigDto>, @Headers('user_id') userId: number) {
  //   return this.service.update(sshId, dto, userId);
  // }

  // @Post('remove')
  // @UseGuards(AdminGuard)
  // getDeleteDeploy(@Query('ssh_id', new ParseIntPipe()) sshId: number, @Headers('user_id') userId: number) {
  //   return this.service.remove(sshId, userId);
  // }
}
