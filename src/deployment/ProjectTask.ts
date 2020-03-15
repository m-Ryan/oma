import { ProjectEntity } from "../modules/project/entities/project.entity";


export interface ProjectItem {

}
/**
 * 假设分三个环境 master，dev，test
 * master dev 和 test 通过 push 的钩子完成编译，除master分支外自动部署，master分支不会自动部署
 * master编译保留记录，并保留最近10次编译的bundle
 */
export class ProjectTask {
  private projectItem: ProjectEntity;
  constructor(projectItem: ProjectEntity) {
    this.projectItem = projectItem;
  }

  /**
   * git clone
   */
  init() {
    this.runClone();
    this.runCompile();
  }

  run() {

  }

  runCompile() {
    this.runTest();
    this.runBuild();
  }

  runClone() {

  }

  runTest() {

  }

  runBuild() {

  }


}