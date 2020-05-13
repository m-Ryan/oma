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
    let error = '';
    const child = shelljs.exec(command, {
      async: true,
      silent: true,
      fatal: true,
    });
    child.stdout.setEncoding('utf8');
    console.log(chalk.yellow(command), `cwd ${cwd}`);
    child.stdout.on('data', function (data) {
      console.log(chalk.blue(`${data.toString()}`));
      onProgress && onProgress(data.toString());
    });
    child.stderr.on('data', function (err) {
      error = err.toString('utf-8');
      onError && onError(err.toString());
    });
    child.stdout.on('end', function () {
      onEnd && onEnd();
    });
    child.on('exit', function (code: number, signal: string) {
      if (code !== 0) {
        console.log(chalk.red(error));
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
