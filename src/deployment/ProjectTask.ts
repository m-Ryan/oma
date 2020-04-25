import path from 'path';
import {
  getTaskTarName,
  existsDir,
  getRepositoryName,
  mkdir,
} from '../utils/util';
import { REPOSITORY_DIR, DEPLOYMENT_DIR } from '../constant';
import { getSSHInstance } from '../utils/ssh';
import { SSHEntity, SSHType } from '../modules/ssh/entities/ssh.entity';
import chalk from 'chalk';
import { decrypt } from '../utils/crypto';
import { Omafile } from '../typing/omafile';
import fs from 'fs-extra';
import shelljs, { env } from 'shelljs';
import { ProjectTaskEntity } from '../modules/project_task/entities/project_task.entity';

export async function createBuildPipline(options: {
  task: ProjectTaskEntity;
  onProgress: (log: string) => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}) {
  const { task, task: { project, project_env, project_env: { ssh } }, onError, onSuccess } = options;
  const projectDir = getRepositoryName(project.git_path);
  const repositoryPath = path.join(REPOSITORY_DIR, projectDir);
  const deploymentDir = path.join(DEPLOYMENT_DIR, projectDir);
  try {
    // stage fetch
    shelljs.cd(repositoryPath);
    shelljs.exec(`git fetch --no-tags --force --progress`);
    shelljs.exec(`git checkout -f ${task.version}`);
    let omafile: Omafile;
    try {
      omafile = await fs.readJSON(path.join(repositoryPath, 'omafile.json'));
    } catch (error) {
      console.log(error);
      onError('该项目没有配置 omafile.json');
    }
    if (!omafile) return;

    await runStage(omafile.stages.fetch, repositoryPath);

    // stage build 
    if (!(await existsDir(deploymentDir))) {
      await mkdir(deploymentDir);
    }

    shelljs.exec(`nvm install ${omafile.node} && nvm use ${omafile.node}`);
    await runStage(omafile.stages.build, repositoryPath);

    // 打包
    const tarName = getTaskTarName(task);
    shelljs.exec(`cd ${deploymentDir} && tar -zcf ${tarName} -C ${path.join(repositoryPath, omafile.uploadDir)} .`);

    if (project_env.auto_deploy) {
      await pushToServer(task);
    }

    onSuccess();
  } catch (error) {
    console.log(error);
    onError(error.message || error.toString());
  }
}

export async function pushToServer(task: ProjectTaskEntity) {

  const { project, project_env, project_env: { ssh } } = task;
  const projectDir = getRepositoryName(project.git_path);
  const deploymentDir = path.join(DEPLOYMENT_DIR, projectDir);
  // push to server 
  const connectOptions: Partial<SSHEntity> = {
    host: ssh.host,
    port: ssh.port,
    username: ssh.username,
  };
  if (ssh.type === SSHType.PWD) {
    connectOptions.password = decrypt(ssh.password);
  } else {
    connectOptions.privateKey = decrypt(ssh.privateKey);
  }
  console.log(chalk.yellow('正在进行服务器连接----'));
  const conn = await getSSHInstance(connectOptions);
  console.log(chalk.yellow('正在进行上传到服务器----'));

  if (!project_env.public_path) {
    throw new Error('project_env.public_path 不能为空');
  }
  const tarName = getTaskTarName(task);
  await new Promise(async (resolve, reject) => {
    try {
      // 打包成临时文件
      const tarPath = path.resolve(deploymentDir, tarName);
      const tempPath = '/tmp/' + tarName;
      console.log('正在上传', tempPath);
      await conn.uploadFile(tarPath, tempPath);
      await conn.execComand(`rm -rf ${project_env.public_path} && mkdir -p ${project_env.public_path}`);
      console.log('正在解压');
      await conn.execComand(`tar -zxPf ${tempPath} -C ${project_env.public_path}`);
      await conn.execComand(`rm -rf ${tempPath}`);
      console.log('上传成功');
      resolve();
    } catch (error) {
      console.log('error', error);
      reject(error);
    }
  });

  conn.end();

}


async function runStage(stage: string | string[], cwd: string) {
  shelljs.cd(cwd);
  if (Array.isArray(stage)) {
    for await (const step of stage) {
      shelljs.exec(step);
    }
  } else {
    shelljs.exec(stage);
  }
}