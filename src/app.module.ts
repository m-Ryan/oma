import { Module, MiddlewareConsumer } from '@nestjs/common';
import { DeploymentCModule } from './modules/project/project.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { isProduction, cwd } from './utils/util';
import { UserModule } from './modules/user/user.module';
import { UserAuthorizeMiddleware } from './common/middleware/user.authorize.middleware';
import { HookModule } from './modules/hooks/hook.module';
import { AppController } from './app.controller';


const mysqlConfigPath = isProduction() ? cwd + '/config/mysql.orm.pro.json' : cwd + '/config/mysql.orm.dev.json';

const ormConfig = require(mysqlConfigPath);

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    DeploymentCModule,
    UserModule,
    HookModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserAuthorizeMiddleware).forRoutes('');
  }
}
