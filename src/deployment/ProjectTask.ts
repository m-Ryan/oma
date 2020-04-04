// import { ProjectEntity } from "../modules/project/entities/project.entity";
import { runExec } from '../utils/shell';
import path from 'path';
import shelljs, { env } from 'shelljs';
import { ProjectTaskEntity } from '../modules/project/entities/project_task.entity';
import {
  getTaskDir,
  existsDir,
  getRepositoryName,
  mkdir,
  readdir,
  getTaskId,
} from '../utils/util';
import { REPOSITORY_DIR, DEPLOYMENT_DIR, MAX_HISTORY_LIMIT } from '../constant';
import { getSSHInstance } from '../utils/ssh';
import { SSHEntity, SSHType } from '../modules/project/entities/ssh.entity';
import chalk from 'chalk';
import { decrypt } from '../utils/crypto';

/**
 * 假设分三个环境 master，dev，test
 * master dev 和 test 通过 push 的钩子完成编译，除master分支外自动部署，master分支不会自动部署
 * master编译保留记录，并保留最近10次编译的bundle
 */

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
  const deploymentPath = path.resolve(deploymentDir, getTaskDir(task));
  await mkdir(deploymentPath);
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
    await conn.upload(DEPLOYMENT_DIR, project_env.public_path);
    conn.end()

    onSuccess();
  } catch (error) {
    console.log(error)
    onError(error.message || error.toString());
  }
}
