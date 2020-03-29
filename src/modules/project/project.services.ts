import { Injectable } from '@nestjs/common';
import { ProjectSchedule } from 'src/src/deployment/schedule';

@Injectable()
export class DeploymentService {

  constructor(private readonly ps: ProjectSchedule) { }

  commitPush() {
    this.ps.run();
    return 'build'
  }

}