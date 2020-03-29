// import { ProjectEntity } from "../modules/project/entities/project.entity";
import { promisify } from "util";
import { existsSync, exists } from "fs";
import path from 'path';
import { PROJECT_CLONE_DIR } from "../constant";
import { runExec } from '../utils/shell';
import dayjs from 'dayjs';

export interface ProjectEntity { project_id: number; git_path: string; name: string; desc: string; }
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
    this.projectDir = path.resolve(PROJECT_CLONE_DIR, projectItem.name);
  }

  /**
   * git clone
   */
  async init() {
    await this.runClone();
    await this.runCompile();
  }

  run() {

  }

  async runCompile() {
    await this.runInstallDependence();
    await this.runTest();
    await this.runBuild();
  }

  async runInstallDependence() {
    await runExec(`yarn install`, {
      onProgress: (logs: string) => console.log(`${dayjs().format('hh:mm:ss')}----${logs}`)
    });
  }

  async runClone() {
    try {
      const git_path = this.projectItem.git_path;
      if (!await promisify(exists)(this.projectDir)) {
        await runExec(`git clone ${git_path} ${this.projectDir}`, {
          onProgress: (logs: string) => console.log(`${dayjs().format('hh:mm:ss')}----${logs}`)
        })
      } else {

      }
    } catch (error) {
      throw error;
    }
  }

  async runTest() {

  }

  runBuild() {

  }


}

