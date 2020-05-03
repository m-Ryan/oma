import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSSHConfigDto } from './dto/create-ssh-config.dto';
import { SSHEntity, SSHType } from './entities/ssh.entity';
import { getNowTimeStamp, formatListResponse, getSkip } from '../../utils/util';
import { encrypt } from '../../utils/crypto';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class SSHService {
  constructor(
    @InjectRepository(SSHEntity) private readonly ssh: Repository<SSHEntity>,
  ) {}

  async getList(page: number, size: number) {
    const condition: QueryDeepPartialEntity<SSHEntity> = {
      deleted_at: 0,
    };

    const data = await this.ssh.findAndCount({
      select: [
        'ssh_id',
        'name',
        'host',
        'port',
        'username',
        'created_at',
        'user_id',
        'updated_user_id',
        'type',
        'updated_at',
        'deleted_at',
      ],
      where: condition,
      take: size,
      skip: getSkip(page, size),
      order: {
        created_at: 'DESC',
      },
    });
    const response = formatListResponse(data);
    // response.list.forEach(item=)
    return formatListResponse(data);
  }

  async create(dto: CreateSSHConfigDto, userId: number) {
    const now = getNowTimeStamp();
    const ssh = this.ssh.create();
    ssh.user_id = userId;
    ssh.name = dto.name;
    ssh.username = dto.username;
    ssh.host = dto.host;
    ssh.port = dto.port;
    ssh.created_at = now;
    ssh.updated_at = now;
    if (dto.password) {
      ssh.password = encrypt(dto.password);
      ssh.type = SSHType.PWD;
    } else {
      ssh.privateKey = encrypt(dto.privateKey);
      ssh.type = SSHType.PRIVATE_KEY;
    }
    await this.ssh.save(ssh);
    return ssh;
  }

  async update(
    sshId: number,
    dto: Partial<CreateSSHConfigDto>,
    userId: number,
  ) {
    const ssh = await this.ssh.findOne({
      ssh_id: sshId,
      deleted_at: 0,
    });
    if (!ssh) {
      throw new NotFoundException('ssh 不存在');
    }
    if (dto.name) ssh.name = dto.name;
    if (dto.host) ssh.host = dto.host;
    if (dto.port) ssh.port = dto.port;
    if (dto.username) ssh.username = dto.username;

    if (dto.type === SSHType.PWD) {
      if (dto.password) {
        ssh.password = encrypt(dto.password);
        ssh.type = SSHType.PWD;
      }
    } else {
      if (dto.privateKey) {
        ssh.privateKey = encrypt(dto.privateKey);
        ssh.type = SSHType.PRIVATE_KEY;
      }
    }

    return this.ssh.save(ssh);
  }

  async remove(sshId: number, userId: number) {
    return this.ssh.update(
      {
        ssh_id: sshId,
        deleted_at: 0,
      },
      {
        deleted_at: 1,
        updated_user_id: userId,
        updated_at: getNowTimeStamp(),
      },
    );
  }
}
