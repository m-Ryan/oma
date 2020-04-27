import { Controller, Get, Post, Body, UseGuards, Headers, Query, ParseIntPipe, Param } from '@nestjs/common';
import { ProjectService } from './project.services';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateProjectEnvironmentDto } from './dto/create-project-env';
import { AuthGuard } from '../../common/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('project')
export class ProjectController {
  constructor(
    private readonly service: ProjectService,
  ) { }

  @Post('create')
  create(@Body() dto: CreateProjectDto, @Headers('user_id') userId: number) {
    return this.service.create(dto, userId);
  }

  @Post('update')
  update(@Body() dto: CreateProjectDto, @Query('project_id', new ParseIntPipe()) projectId: number, @Headers('user_id') userId: number) {
    return this.service.update(projectId, dto, userId);
  }

  @Post('remove')
  remove(@Query('project_id', new ParseIntPipe()) projectId: number, @Headers('user_id') userId: number) {
    return this.service.remove(projectId, userId);
  }

  @Get('list')
  getList(@Query('page', new ParseIntPipe()) page: number, @Query('size', new ParseIntPipe()) size: number, @Headers('user_id') userId: number) {
    return this.service.getList(page, size, userId);
  }

}