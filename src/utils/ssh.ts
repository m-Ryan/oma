
import { Client, ConnectConfig, SFTPWrapper, ClientChannel } from 'ssh2';
import {
  TransferOptions,
  FileEntry
} from "ssh2-streams";
import { delay } from './util';
import path from 'path';
import { DEPLOYMENT_DIR } from '../constant';
import { runExec } from './shell';

export function connectSSH(config: ConnectConfig) {
  const conn = new Client();
  return new Promise<Client>((resolve, reject) => {
    conn
      .on('ready', () => resolve(conn))
      .on('error', (err) => reject(err))
      .connect(config)
  })
}


export async function getSSHInstance(config: ConnectConfig) {
  const conn = await connectSSH(config) as SSHInstance;

  const sftp = await new Promise<SFTPWrapper>((resolve, reject) => {
    conn.sftp((err, sftp) => {
      err && reject(err);
      resolve(sftp);
    })
  })

  conn.uploadFile = async (localPath: string, remotePath: string, options?: TransferOptions) => {
    return new Promise((resolve, reject) => {
      sftp.fastPut(localPath, remotePath, (err) => {
        err && reject(err);
        resolve();
      });
    })
  }

  conn.downloadFile = async (localPath: string, remotePath: string, options?: TransferOptions) => {
    return new Promise((resolve, reject) => {
      sftp.fastGet(remotePath, localPath, (err) => {
        err && reject(err);
        resolve();
      });
    })
  }

  conn.existDir = async (location: string | Buffer) => {
    return new Promise<boolean>((resolve, reject) => {
      sftp.readdir(location, (err, list) => {
        if (err) resolve(false);
        resolve(true);
      });
    })
  }

  conn.readDir = async (location: string | Buffer) => {
    return new Promise<FileEntry[]>((resolve, reject) => {
      sftp.readdir(location, (err, list) => {
        if (err) reject(err);
        resolve(list);
      });
    })
  }


  conn.upload = (localPath: string, remotePath: string, options?: TransferOptions) => {
    if (!remotePath) {
      throw new Error('remotePath 不能为空');
    }
    return new Promise(async (resolve, reject) => {
      try {
        // 打包成临时文件
        const tarName = Date.now() + '_ssh.tar.gz';
        const tempPath = '/tmp/' + tarName;
        await runExec(`tar -zcf ${tarName} -C ${localPath} .`);
        await conn.uploadFile(tarName, tempPath);
        await conn.execComand(`rm -rf ${remotePath} && mkdir ${remotePath}`);
        await conn.execComand(`tar -zxPf ${tempPath} -C ${remotePath}`);
        await conn.execComand(`rm -rf ${tempPath}`);
        resolve();
      } catch (error) {
        console.log('error', error)
        reject(error);
      }
    })
  }

  conn.execComand = async (command: string, params: {
    onData?: (chunk?: Buffer) => void,
    onStderrData?: (data: string) => void,
    onClose?: () => void,
  } = {}) => {
    const { onData, onStderrData, onClose } = params;
    return new Promise<ClientChannel>((resolve, reject) => {
      conn.exec(command, (err, stream: ClientChannel) => {
        if (err) {
          return reject(err);
        }
        stream.on('data', (chunk?: Buffer) => {
          onData && onData(chunk);
        });
        stream.stderr.on('data', (data: string) => {
          onStderrData && onStderrData(data);
        });
        stream.on('close', () => {
          onClose && onClose();
          resolve();
        });
      });
    })

  }

  return conn;
}

export interface SSHInstance extends Client {
  readDir: (location: string | Buffer) => Promise<FileEntry[]>;
  existDir: (location: string | Buffer) => Promise<boolean>;
  upload: (localPath: string, remotePath: string, options?: TransferOptions) => Promise<void>;
  uploadFile: (localPath: string, remotePath: string, options?: TransferOptions) => Promise<void>;
  downloadFile: (localPath: string, remotePath: string, options?: TransferOptions) => Promise<void>;
  execComand: (command: string, params?: {
    onData?: (chunk?: Buffer) => void,
    onStderrData?: (data: string) => void,
    onClose?: () => void,
  }) => Promise<ClientChannel>;
}