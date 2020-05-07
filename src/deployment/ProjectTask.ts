import path from 'path';
import {
  getTaskTarName,
  existsDir,
  getRepositoryName,
  mkdir,
} from '../utils/util';
import { REPOSITORY_DIR, DEPLOYMENT_DIR } from '../constant';
import { getSSHInstance, SSHInstance } from '../utils/ssh';
import { SSHEntity, SSHType } from '../modules/ssh/entities/ssh.entity';
import chalk from 'chalk';
import { decrypt } from '../utils/crypto';
import { Omafile } from '../typing/omafile';
import fs from 'fs-extra';
import { ProjectTaskEntity } from '../modules/project_task/entities/project_task.entity';
import { runExec } from '../utils/shell';
import { NotAcceptableException } from '@nestjs/common';

export async function createBuildPipline(options: {
  task: ProjectTaskEntity;
  onProgress: (log: string) => void;
  onSuccess: (information: string) => void;
  onError: (information: string) => void;
}) {
  const {
    task,
    task: {
      project_env,
      project_env: { project },
    },
    onError,
    onSuccess,
  } = options;
  const projectDir = getRepositoryName(project.git_path);
  const repositoryPath = path.join(REPOSITORY_DIR, projectDir);
  const deploymentDir = path.join(DEPLOYMENT_DIR, projectDir);
  const information: string[] = [];
  try {
    let omafile: Omafile;
    try {
      omafile = await fs.readJSON(path.join(repositoryPath, 'omafile.json'));
    } catch (error) {
      console.log(error);
      onError('该项目没有配置 omafile.json');
    }

    // stage fetch
    try {
      await runExec(`git reset --hard`, {
        cwd: repositoryPath,
        onProgress: data => information.push(data),
      });
      await runExec(`git checkout -f ${task.version}`, {
        cwd: repositoryPath,
        onProgress: data => information.push(data),
      });
      await runExec(`git pull --no-tags --force --progress`, {
        cwd: repositoryPath,
        onProgress: data => information.push(data),
      });

    } catch (error) { }

    if (!omafile) return onError('该项目没有配置 omafile.json');
    console.log('run stage - fetch');
    information.push(...(await runStage(omafile.stages.fetch, repositoryPath)));

    // stage build
    if (!(await existsDir(deploymentDir))) {
      await mkdir(deploymentDir);
    }

    if (omafile.node) {
      await runExec(`nvm use ${omafile.node}`, {
        onProgress: data => information.push(data),
      });
    }

    console.log('run stage - build');
    information.push(...(await runStage(omafile.stages.build, repositoryPath)));

    console.log('正在打包');
    // 打包
    const tarName = getTaskTarName(task);
    await runExec(
      `tar -zcf ${tarName} -C ${path.join(
        repositoryPath,
        omafile.uploadDir,
      )} .`,
      {
        cwd: deploymentDir,
        onProgress: data => information.push(data),
      },
    );

    if (project_env.auto_deploy) {
      await pushToServer(task);
    }

    onSuccess(information.join(''));
  } catch (error) {
    information.push(error.toString());
    onError(information.join(''));
  }
}

export async function pushToServer(task: ProjectTaskEntity) {
  const {
    project_env: { ssh, project },
  } = task;
  const projectDir = getRepositoryName(project.git_path);
  const repositoryPath = path.join(REPOSITORY_DIR, projectDir);
  const deploymentDir = path.join(DEPLOYMENT_DIR, projectDir);

  let omafile: Omafile;
  try {
    omafile = await fs.readJSON(path.join(repositoryPath, 'omafile.json'));
  } catch (error) {
    if (!omafile) throw new NotAcceptableException('omafile.json 配置错误');
  }
  if (!omafile) throw new NotAcceptableException('该项目没有配置 omafile.json');

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

  if (!project.upload_floder) {
    throw new Error('上传目录不能为空');
  }
  const tarName = getTaskTarName(task);
  return new Promise(async (resolve, reject) => {
    try {
      // 打包成临时文件
      const tarPath = path.resolve(deploymentDir, tarName);
      const tempPath = '/tmp/' + tarName;
      console.log('正在上传', tempPath);
      await conn.uploadFile(tarPath, tempPath);
      console.log(
        '创建目录',
        `rm -rf ${project.upload_floder} && mkdir -p ${project.upload_floder}`,
      );
      await conn.execComand(
        `rm -rf ${project.upload_floder} && mkdir -p ${project.upload_floder}`,
      );
      console.log(
        '正在解压',
        `tar -zxPf ${tempPath} -C ${project.upload_floder}`,
      );
      await conn.execComand(
        `tar -zxPf ${tempPath} -C ${project.upload_floder}`,
      );
      await conn.execComand(`rm -rf ${tempPath}`);
      console.log('上传成功');

      console.log('run stage - deploy');
      await runDeployStage(omafile.stages.deploy, project.upload_floder, conn);
      resolve();
    } catch (error) {
      conn.end();
      reject(error);
    }
  });
}

async function runStage(
  stage: { cwd: string; command: string; }[],
  cwd: string,
) {
  const information: string[] = [];
  if (!stage) return information;
  for await (const step of stage) {
    await runExec(step.command, {
      cwd: path.resolve(cwd, step.cwd),
      onProgress: data => information.push(data),
    });
  }
  return information;
}

async function runDeployStage(
  stage: { cwd: string; command: string; }[],
  cwd: string,
  conn: SSHInstance,
) {
  const information: string[] = [];
  if (!stage) return information;
  for await (const step of stage) {
    await conn.execComand(step.command, {
      cwd: cwd + '/' + step.cwd,
      onStdoutData: data => information.push(data),
      onStderrData: data => information.push(data),
    });
  }
  return information;
}
