// import { ProjectEntity } from "../modules/project/entities/project.entity";
import { runExec } from '../utils/shell';
import path from 'path';
import shelljs from 'shelljs';
import { ProjectTaskEntity } from '../modules/project/entities/project_task.entity';
import { getTaskDir, existsDir } from '../utils/util';

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
  const projectDir = project.git_path.replace(/(.*)\/(.*)\.git$/, '$2');
  const repositoryPath = path.resolve('../../.repository', projectDir);
  const deploymentPath = path.resolve(
    '../../.deployment',
    projectDir,
    getTaskDir(task),
  );

  try {
    if (!existsDir(repositoryPath)) {
      await runExec(`git clone ${project.git_path} ${repositoryPath}`, {
        onProgress,
      });
    }

    await runExec(`yarn install`, {
      onProgress,
    });

    await runExec(`yarn build`, {
      onProgress,
    });

    shelljs.cp('-R', `${repositoryPath}/build`, deploymentPath);
    onSuccess();
  } catch (error) {
    onError(error.message || error.toString());
  }
}
