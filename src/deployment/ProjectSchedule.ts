import { createBuildPipline } from './ProjectTask';
import { ProjectTaskEntity } from '../modules/project_task/entities/project_task.entity';
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
          onSuccess: () => {
            this.onTaskOver({ task });
          },
          onError: errMsg => {
            this.onTaskOver({ task, errMsg });
          },
        });
      });
    }, 3000);
  }

  async onTaskOver({
    task,
    errMsg,
  }: {
    task: ProjectTaskEntity;
    errMsg?: string;
  }) {
    this.service.update(task.task_id, { errMsg });
    this.taskBuildQueue = this.taskBuildQueue.filter(item => item !== task);
  }
}
