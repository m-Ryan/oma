import { Controller, Get, Post, Body, UseGuards, Headers, Query, ParseIntPipe, Param } from '@nestjs/common';
import { ProjectTaskService } from './project_task.services';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@UseGuards(AuthGuard)
@Controller('project-task')
export class ProjectTaskController {
  constructor(
    private readonly service: ProjectTaskService,
  ) { }

  // @Get('list')
  // getDeployList(@Query('page', new ParseIntPipe()) page: number, @Query('size', new ParseIntPipe()) size: number) {
  //   return this.service.getList(page, size);
  // }

  // @Post('create')
  // addDeploy(
  //   @Body() dto: CreateDeployConfigDto,
  //   @Headers('user_id') userId: number
  // ) {
  //   return this.service.create(dto, userId);
  // }

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