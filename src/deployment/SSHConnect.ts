import { InjectRepository } from "@nestjs/typeorm";
import { SSHEntity } from "../modules/project/entities/ssh.entity";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";


@Injectable()
export class SSHConnect {
    constructor(
        @InjectRepository(SSHEntity) private readonly ssh: Repository<SSHEntity>,
    ) { }

    async serverPush() {

    }


}

