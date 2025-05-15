import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { WechatService } from './wechat.service';
import { WechatController } from './wechat.controller';
import { WechatMiddleware } from './wechat.middleware';
import { RequestModule } from '../request/request.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { TaoModule } from '../tao/tao.module';

@Module({
  imports: [
    RequestModule,
    TaoModule,
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [WechatController],
  providers: [WechatService],
})
export class WechatModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(WechatMiddleware).forRoutes('wechat');
  }
}
