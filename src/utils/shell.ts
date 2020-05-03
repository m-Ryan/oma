import shelljs from 'shelljs';
import chalk from 'chalk';

export function runExec(
  command: string,
  options: {
    cwd?: string;
    onProgress?: (data: any) => void;
    onError?: (data: any) => void;
    onEnd?: () => void;
  } = {},
) {
  const { onProgress, onError, onEnd, cwd } = options;
  return new Promise<void>((resolve, reject) => {
    if (cwd) {
      shelljs.cd(cwd);
    }
    const child = shelljs.exec(command, { async: true, silent: true });
    console.log(chalk.yellow(command), `cwd ${cwd}`);
    child.stdout.on('data', function(data) {
      console.log(chalk.blue(`${data}`));
      onProgress && onProgress(data);
    });
    child.stdout.on('end', function() {
      console.log('end');
      onEnd && onEnd();
      resolve();
    });
    child.stdout.on('error', function(error) {
      console.log(chalk.red(`${error}`));
      onError(error);
      reject(error);
    });
  });
}
