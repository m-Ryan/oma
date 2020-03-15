export interface ProjectItem {

}

export class ProjectSchedule {

  private projects = [];

  add(item: ProjectItem) {
    this.projects.push(item);
  }

  run() {
    console.log('run')
  }

  register() {

  }



}