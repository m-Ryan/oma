// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common';
// import { mkdir } from './utils/util';
// import { DEPLOYMENT_DIR, REPOSITORY_DIR } from './constant';

// // import { ProjectTask } from "./deployment/ProjectTask";

// async function bootstrap() {
//   try {
//     const app = await NestFactory.create(AppModule);
//     app.useGlobalPipes(new ValidationPipe());

//     Promise.all([
//       mkdir(DEPLOYMENT_DIR),
//       mkdir(REPOSITORY_DIR),
//       app.listen(7000)
//     ])
//   } catch (error) {
//     console.log(error)
//   }

// }
// bootstrap();

import {Client} from 'ssh2';
import { connectSSH } from './deployment/SSHConnect';

async function run() {
const conn = await connectSSH({
  host: '',
  port: 22,
  username: 'root',
  password: ''
  // privateKey: require('fs').readFileSync('/here/is/my/key')
})
// conn.exec('cd /usr/web && ls', function(err, stream) {
//   if (err) throw err;
//   stream.on('close', function(code: number, signal: any) {
//     console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
//     conn.end();
//   }).on('data', function(data: any) {
//     console.log('STDOUT: ' + data);
//   }).stderr.on('data', function(data) {
//     console.log('STDERR: ' + data);
//   });
// });
}

run();