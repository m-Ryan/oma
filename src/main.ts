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

import { Client } from 'ssh2';
import { getSSHInstance } from './utils/ssh';

async function run() {
  try {
    const conn = await getSSHInstance({
      host: '122.51.191.21',
      port: 22,
      username: 'root',
      password: ''
      // privateKey: require('fs').readFileSync('/here/is/my/key')
    })
    const stream = await conn.execComand('cd /usr/web && ls');

    // stream.on('data', function (data: any) {
    //   console.log('STDOUT: ' + data);
    // }).stderr.on('data', function (data) {
    //   console.log('STDERR: ' + data);
    // });

    await conn.downloadFile('/test', '/usr/web/oma/src');
    conn.end()
  } catch (error) {
    console.log(error)
  }

}

run();