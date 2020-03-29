// import { ProjectEntity } from "../modules/project/entities/project.entity";
import { runExec } from '../utils/shell';
import dayjs from 'dayjs';
import { ProjectTaskEntity } from '../modules/project/entities/project_task.entity';

/**
 * 假设分三个环境 master，dev，test
 * master dev 和 test 通过 push 的钩子完成编译，除master分支外自动部署，master分支不会自动部署
 * master编译保留记录，并保留最近10次编译的bundle
 */

export async function createBuildPipline(options: {
  task: ProjectTaskEntity,
  onProgress: (log: string) => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}) {
  const { task, onError, onSuccess, onProgress } = options;
  const project = task.project;
  const projectDir = project.git_path.replace(/(.*)\/(.*)\.git$/, '$2');
  try {
    await runExec(`git clone ${project.git_path} ${projectDir}`, {
      onProgress
    });
    await runExec(`yarn install`, {
      onProgress
    });
    await runExec(`yarn build`, {
      onProgress
    });
    onSuccess();

  } catch (error) {
    onError(error.message || error.toString());
  }
}
