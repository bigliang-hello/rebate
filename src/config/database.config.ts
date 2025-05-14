import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    url: configService.get<string>('POSTGRES_URL'),
    entities: [User],
    retryAttempts: 3,
    ssl: true, 
    extra: {
      ssl: {
        rejectUnauthorized: false
      }
    },
    synchronize: false
  };
};