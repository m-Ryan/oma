import { Controller, Get, Post, Body, UseGuards, Headers } from '@nestjs/common';
import { CreatePushMergePRDTO } from './dto/push-merge.pr.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { HookService } from './hook.services';

@UseGuards(AuthGuard)
@Controller('hook')
export class HookController {
  constructor(
    private readonly service: HookService,
  ) { }


  @Post('push')
  pushMergePR(@Body() dto: CreatePushMergePRDTO) {
    return this.service.pushMergePR(dto);
  }

}