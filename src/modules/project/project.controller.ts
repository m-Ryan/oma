import { Controller, Get, Post, Body } from '@nestjs/common';
import { DeploymentService } from './project.services';
import { ProjectTask } from 'src/src/deployment/ProjectTask';

@Controller('deployment')
export class DeploymentController {
  constructor(private readonly service: DeploymentService) { }


  @Get('push')
  findAll() {
    return this.service.commitPush();
  }

  @Post('push')
  push(@Body() data: any) {
    console.log(data);
    return data;
  }


  @Get()
  async clone() {
    const pt = new ProjectTask({
      project_id: 1,
      git_path: 'git@github.com:m-Ryan/ry-wx.git',
      name: '微信小程序',
      desc: 'asdas'
    });
    console.log('ssss')
    await pt.init();
    console.log('tttt')
  }


}