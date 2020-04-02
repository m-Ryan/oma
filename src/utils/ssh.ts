
import { Client, ConnectConfig, SFTPWrapper, ClientChannel } from 'ssh2';
import {
  TransferOptions,
} from "ssh2-streams";

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

  conn.execComand = async (command: string) => {
    const stream = await new Promise<ClientChannel>((resolve, reject) => {
      conn.exec(command, (err, stream: ClientChannel) => {
        err && reject(err);
        resolve(stream);
      });
    })

    return stream;
  }

  return conn;
}

export interface SSHInstance extends Client {
  uploadFile: (localPath: string, remotePath: string, options?: TransferOptions) => Promise<void>;
  downloadFile: (localPath: string, remotePath: string, options?: TransferOptions) => Promise<void>;
  execComand: (command: string) => Promise<ClientChannel>;
}