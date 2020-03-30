import shelljs from 'shelljs';
import chalk from 'chalk';

export function runExec(command: string, options: {
  cwd?: string,
  onProgress?: (data: any) => void
} = {}) {
  const { onProgress, cwd } = options;
  return new Promise<void>((resolve, reject) => {
    if (cwd) {
      shelljs.cd(cwd);
    }
    const child = shelljs.exec(command, { async: true, silent: true });
    console.log(chalk.yellow(command));
    child.stdout.on('data', function (data) {
      console.log(chalk.blue(`${data}`));
      onProgress && onProgress(data)
    });
    child.stdout.on('end', function () {
      resolve();
    });
    child.stdout.on('error', function (data) {
      reject(data);
    });
  })
}