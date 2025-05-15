import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    url: configService.get<string>('DB_URL'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    retryAttempts: 3,
    ssl: true, 
    extra: {
      ssl: {
        rejectUnauthorized: false
      }
    },
    //product环境关闭同步
    synchronize: true
  };
};