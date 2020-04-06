// import { ProjectEntity } from "../modules/project/entities/project.entity";
import { runExec } from '../utils/shell';
import path from 'path';
import { ProjectTaskEntity } from '../modules/project/entities/project_task.entity';
import {
  getTaskTarName,
  existsDir,
  getRepositoryName,
  mkdir,
} from '../utils/util';
import { REPOSITORY_DIR, DEPLOYMENT_DIR, MAX_HISTORY_LIMIT } from '../constant';
import { getSSHInstance } from '../utils/ssh';
import { SSHEntity, SSHType } from '../modules/project/entities/ssh.entity';
import chalk from 'chalk';
import { decrypt } from '../utils/crypto';
import { exec } from 'shelljs';

export class Pipline {
  private task: ProjectTaskEntity;
  constructor(task: ProjectTaskEntity) {
    this.task = task;
  }

  async runTask() {
    await this.fetch();
    await this.build();
    await this.deploy();
  }

  async fetch() {
    const branch = this.task.branch;
    await exec(`git fetch --no-tags --force --progress`);
    await exec(`git checkout -f ${branch}`);

    `
   Fetching upstream changes from https://github.com/m-Ryan/building-a-multibranch-pipeline-project.git

 > git --version # timeout=10

 > git fetch --no-tags --force --progress -- https://github.com/m-Ryan/building-a-multibranch-pipeline-project.git +refs/heads/master:refs/remotes/origin/master # timeout=10

 > git config remote.origin.url https://github.com/m-Ryan/building-a-multibranch-pipeline-project.git # timeout=10

 > git config --add remote.origin.fetch +refs/heads/master:refs/remotes/origin/master # timeout=10

 > git config remote.origin.url https://github.com/m-Ryan/building-a-multibranch-pipeline-project.git # timeout=10

Fetching without tags

Fetching upstream changes from https://github.com/m-Ryan/building-a-multibranch-pipeline-project.git

 > git fetch --no-tags --force --progress -- https://github.com/m-Ryan/building-a-multibranch-pipeline-project.git +refs/heads/master:refs/remotes/origin/master # timeout=10

Checking out Revision e486ee40486bab10fe0af1c0ebafc5a19fd50fe4 (master)

 > git config core.sparsecheckout # timeout=10

 > git checkout -f e486ee40486bab10fe0af1c0ebafc5a19fd50fe4 # timeout=10

Commit message: "Amend README.md"

First time build. Skipping changelog.

 > git --version # timeout=10
   `
  }

  build() {

  }

  deploy() {

  }

}

export async function createBuildPipline(options: {
  task: ProjectTaskEntity;
  onProgress: (log: string) => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}) {
  const { task, task: { project_env, project_env: { project, ssh } }, onError, onSuccess, onProgress } = options;
  const projectDir = getRepositoryName(project.git_path);
  const repositoryPath = path.resolve(REPOSITORY_DIR, projectDir);
  const deploymentDir = path.resolve(DEPLOYMENT_DIR, projectDir);

  try {
    if (!(await existsDir(repositoryPath))) {
      await runExec(`git clone ${project.git_path} ${repositoryPath}`, {
        onProgress,
      });
    }

    await runExec(`yarn install`, {
      onProgress,
      cwd: repositoryPath,
    });

    await runExec(`yarn build`, {
      onProgress,
      cwd: repositoryPath,
    });

    if (!(await existsDir(deploymentDir))) {
      await mkdir(deploymentDir);

    }

    // 打包
    const tarName = getTaskTarName(task);
    await runExec(`cd ${deploymentDir} && tar -zcf ${tarName} -C ${repositoryPath}/build .`);

    // push to server 
    const connectOptions: Partial<SSHEntity> = {
      host: ssh.host,
      port: ssh.port,
      username: ssh.username,
    }
    if (ssh.type === SSHType.PWD) {
      connectOptions.password = decrypt(ssh.password);
    } else {
      connectOptions.privateKey = decrypt(ssh.privateKey);
    }
    console.log(chalk.yellow('正在进行服务器连接----'));
    const conn = await getSSHInstance(connectOptions);
    console.log(chalk.yellow('正在进行上传到服务器----'));

    if (!project_env.public_path) {
      throw new Error(' project_env.public_path 不能为空');
    }
    await new Promise(async (resolve, reject) => {
      try {
        // 打包成临时文件
        const tarPath = path.resolve(deploymentDir, tarName);
        const tempPath = '/tmp/' + tarName;
        console.log('正在上传');
        await conn.uploadFile(tarPath, tempPath);
        await conn.execComand(`rm -rf ${project_env.public_path} && mkdir ${project_env.public_path}`);
        console.log('正在解压');
        await conn.execComand(`tar -zxPf ${tempPath} -C ${project_env.public_path}`);
        await conn.execComand(`rm -rf ${tempPath}`);
        console.log('上传成功');
        resolve();
      } catch (error) {
        console.log('error', error)
        reject(error);
      }
    })

    conn.end()

    onSuccess();
  } catch (error) {
    console.log(error)
    onError(error.message || error.toString());
  }
}
