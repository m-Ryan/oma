import { ProjectEntity } from "../modules/project/entities/project.entity";
import { exec, cd, echo, ExecOptions } from 'shelljs';
import { promisify } from "util";
import { existsSync } from "fs";
import path from 'path';
import { PROJECT_CLONE_DIR } from "../constant";

export interface ProjectItem {

}
/**
 * 假设分三个环境 master，dev，test
 * master dev 和 test 通过 push 的钩子完成编译，除master分支外自动部署，master分支不会自动部署
 * master编译保留记录，并保留最近10次编译的bundle
 */
export class ProjectTask {
  private projectItem: ProjectEntity;
  private projectDir: string;
  constructor(projectItem: ProjectEntity) {
    this.projectItem = projectItem;
    const projectName = path.basename(projectItem.git_path).replace('.git', '');
    this.projectDir = path.resolve(PROJECT_CLONE_DIR, projectName);
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

  async runClone() {
    const git_path = this.projectItem.git_path;
    const name = this.projectItem.name;
    if (await promisify(existsSync)(this.projectDir)) {

    }
  }

  async runTest() {
    console.log('test')
  }

  runBuild() {

  }


}

