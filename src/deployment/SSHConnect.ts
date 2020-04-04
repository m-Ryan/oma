import { InjectRepository } from "@nestjs/typeorm";
import { SSHEntity } from "../modules/project/entities/ssh.entity";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { getSSHInstance } from "../utils/ssh";
import { DEPLOYMENT_DIR } from "../constant";


@Injectable()
export class SSHConnect {
    constructor(
        @InjectRepository(SSHEntity) private readonly ssh: Repository<SSHEntity>,
    ) { }

    async serverPush() {
        try {
            const conn = await getSSHInstance({
                host: '122.51.191.21',
                port: 22,
                username: 'root',
                password: '19960418Mch'
            })
            await conn.upload(DEPLOYMENT_DIR, '/usr/web/oma/src/utils');
            conn.end()
        } catch (error) {
            console.log(error)
        }
    }




}

