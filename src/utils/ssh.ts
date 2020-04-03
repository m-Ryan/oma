
import { Client, ConnectConfig, SFTPWrapper, ClientChannel } from 'ssh2';
import {
  TransferOptions,
} from "ssh2-streams";
import { delay } from './util';
import shelljs from 'shelljs';
import path from 'path';

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
  conn.upload = (localPath: string, remotePath: string, options?: TransferOptions) => {
    return new Promise(async (resolve, reject) => {
      try {
        // 打包成临时文件
        const tarName = Date.now() + '_ssh.tar.gz';
        const tarPath = path.resolve('.deployment', tarName);
        const tempPath =  '/tmp/' + tarName;
        const endPath = remotePath;
        console.log('正在打包', `tar -zcvf ${tarPath} ${localPath}`);
        await shelljs.exec(`tar -zcvf ${tarPath} ${localPath}`);
        console.log('正在上传', tarPath, tempPath);
        await conn.uploadFile(tarPath, tempPath);
        console.log(`tar -zxvf ${tempPath} -C ${endPath}`)
        await conn.execComand(`tar -zxvf ${tempPath} -C ${endPath}`)
        console.log('完成');
        resolve();
      } catch (error) {
        reject(error);
      }
    })
  }

  conn.execComand = async (command: string, params: {
    onData?: (chunk?: Buffer)=> void,
    onStderrData?: (data: string)=> void,
    onClose?: ()=> void,
  } = {}) => {
    const {onData, onStderrData, onClose } = params;
    return new Promise<ClientChannel>((resolve, reject) => {
      conn.exec(command, (err, stream: ClientChannel) => {
        err && reject(err);
        stream.on('data', (chunk?: Buffer)=> {
          onData && onData(chunk);
        });
        stream.stderr.on('data', (data: string)=> {
          onStderrData && onStderrData(data);
        });
        stream.on('close', ()=> {
          onClose && onClose();
          resolve();
        });
      });
    })

  }

  return conn;
}

export interface SSHInstance extends Client {
  upload: (localPath: string, remotePath: string, options?: TransferOptions) => Promise<void>;
  uploadFile: (localPath: string, remotePath: string, options?: TransferOptions) => Promise<void>;
  downloadFile: (localPath: string, remotePath: string, options?: TransferOptions) => Promise<void>;
  execComand: (command: string, params?: {
    onData?: (chunk?: Buffer)=> void,
    onStderrData?: (data: string)=> void,
    onClose?: ()=> void,
  }) => Promise<ClientChannel>;
}