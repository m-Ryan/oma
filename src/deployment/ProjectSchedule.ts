import { createBuildPipline } from './ProjectTask';
import {
  ProjectTaskEntity,
  ProjectTaskEntityStatus,
} from '../modules/project_task/entities/project_task.entity';
import { ProjectTaskService } from '../modules/project_task/project_task.services';

export class ProjectSchedule {
  private taskQueue: ProjectTaskEntity[] = [];
  private taskBuildQueue: ProjectTaskEntity[] = [];
  private maxLimit: number = 2;
  private service: ProjectTaskService;
  constructor(service: ProjectTaskService) {
    this.service = service;
    this.polling();
  }

  async createTask(task: ProjectTaskEntity) {
    this.taskQueue.push(task);
  }

  polling() {
    setInterval(() => {
      const tasks = this.taskQueue.splice(
        0,
        this.maxLimit - this.taskBuildQueue.length,
      );
      if (tasks.length === 0) return;
      this.taskBuildQueue.push(...tasks);
      tasks.forEach(task => {
        createBuildPipline({
          task,
          onProgress: logs => {
            console.log(logs);
          },
          onSuccess: infomation => {
            this.onTaskOver({
              task,
              infomation,
              status: ProjectTaskEntityStatus.SUCCESS,
            });
          },
          onError: infomation => {
            this.onTaskOver({
              task,
              infomation,
              status: ProjectTaskEntityStatus.ERROR,
            });
          },
        });
      });
    }, 3000);
  }

  async onTaskOver({
    task,
    infomation,
    status,
  }: {
    task: ProjectTaskEntity;
    infomation: string;
    status: ProjectTaskEntityStatus;
  }) {
    this.service.update(task.task_id, { infomation, status });
    this.taskBuildQueue = this.taskBuildQueue.filter(item => item !== task);
  }
}
