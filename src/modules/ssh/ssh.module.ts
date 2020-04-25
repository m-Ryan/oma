import { Module } from '@nestjs/common';
import { SSHService } from './ssh.services';
import { SSHController } from './ssh.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SSHEntity } from './entities/ssh.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SSHEntity
    ])
  ],
  controllers: [SSHController],
  providers: [SSHService],
})
export class SSHCModule { }
