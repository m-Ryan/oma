// import { ProjectEntity } from "../modules/project/entities/project.entity";
import { runExec } from '../utils/shell';
import path from 'path';
import shelljs from 'shelljs';
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
  const { task, onError, onSuccess, onProgress } = options;
  const project = task.project;
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

    // const removeDirs = await readdir(deploymentDir).then(files => {
    //   return files
    //     .sort((a: string, b: string) =>
    //       getTaskId(b) - getTaskId(a) > 0 ? 1 : -1,
    //     )
    //     .filter((item, index) => index >= MAX_HISTORY_LIMIT - 1)
    //     .map(file => path.resolve(deploymentDir, file));
    // });
    // shelljs.rm('-rf', ...removeDirs);
    shelljs.cp('-f', `${repositoryPath}/build`, deploymentPath);
    onSuccess();
  } catch (error) {
    onError(error.message || error.toString());
  }
}
