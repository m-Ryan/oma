import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { mkdir } from './utils/util';
import { DEPLOYMENT_DIR, REPOSITORY_DIR } from './constant';
import { UserInterceptor } from './common/interceptors/user.interceptor';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new UserInterceptor());
    Promise.all([
      mkdir(DEPLOYMENT_DIR),
      mkdir(REPOSITORY_DIR),
      app.listen(7000)
    ]);
  } catch (error) {
    console.log(error);
  }

}
bootstrap();
