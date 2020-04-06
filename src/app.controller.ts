import { Controller, Get, Post, Body, UseGuards, Headers } from '@nestjs/common';
import { getNowTimeStamp } from './utils/util';
const now = getNowTimeStamp();

@Controller()
export class AppController {

  @Get()
  getVersion() {
    return now;
  }

}