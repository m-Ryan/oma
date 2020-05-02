import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ProjectCModule } from './modules/project/project.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { isProduction, cwd } from './utils/util';
import { UserModule } from './modules/user/user.module';
import { UserAuthorizeMiddleware } from './common/middleware/user.authorize.middleware';
import { AppController } from './app.controller';
import { SSHCModule } from './modules/ssh/ssh.module';
import { ProjectTaskModule } from './modules/project_task/project_task.module';

const mysqlConfigPath = isProduction()
  ? cwd + '/config/mysql.orm.pro.json'
  : cwd + '/config/mysql.orm.dev.json';

const ormConfig = require(mysqlConfigPath);

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    ProjectCModule,
    ProjectTaskModule,
    SSHCModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserAuthorizeMiddleware).forRoutes('');
  }
}
