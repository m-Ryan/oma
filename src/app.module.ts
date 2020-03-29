import { Module } from '@nestjs/common';
import { DeploymentCModule } from './modules/project/project.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { isProduction } from './utils/util';

const cwd = process.cwd();
const mysqlConfigPath = isProduction() ? cwd + '/config/mysql.orm.pro.json' : cwd + '/config/mysql.orm.dev.json';

const ormConfig = require(mysqlConfigPath);

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    DeploymentCModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor() {
    console.log('init ')
  }
}
