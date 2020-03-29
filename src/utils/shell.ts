import shelljs from 'shelljs';
import chalk from 'chalk';

export function runExec(command: string, options: {
  onProgress?: (data: any) => void
} = {}) {
  const { onProgress } = options;
  return new Promise<void>((resolve, reject) => {
    const child = shelljs.exec(command, { async: true });
    console.log(chalk.yellow(command));
    child.stdout.on('data', function (data) {
      console.log('onProgress')
      console.log(chalk.blue(`onProgress, ${data}`));
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