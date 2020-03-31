import { InjectRepository } from "@nestjs/typeorm";
import { SSHEntity } from "../modules/project/entities/ssh.entity";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import {Client, ConnectConfig, SFTPWrapper} from 'ssh2';
import {
    TransferOptions,
} from "ssh2-streams";

@Injectable()
export class SSHConnect {
    constructor(
        @InjectRepository(SSHEntity) private readonly ssh: Repository<SSHEntity>,
    ) {}

    async getInstance(config: ConnectConfig) {
        const conn = await connectSSH(config) as SSHInstance;
        conn.uploadFile = (remotePath: string, localPath: string, options: TransferOptions)=> {
            conn.sftp(function(err, sftp){
                if(err){
                    then(err);
                }else{
                    sftp.fastPut(localPath, remotePath, function(err, result){
                        conn.end();
                        then(err, result);
                    });
                }
            });
    
        }
    }

    async serverPush() {
      
    }

    
}

export function connectSSH(config: ConnectConfig) {
    const conn = new Client();
    return new Promise<Client>((resolve, reject)=> {
        conn
        .on('ready', () => resolve(conn))
        .on('error', (err) => reject(err))
        .connect(config)
    })
}

export interface SSHInstance extends Client {
    uploadFile: ()=>any
}