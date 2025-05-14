import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { WechatService } from './wechat.service';
import { WechatController } from './wechat.controller';
import { WechatMiddleware } from './wechat.middleware';

@Module({
  controllers: [WechatController],
  providers: [WechatService],
})
export class WechatModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(WechatMiddleware).forRoutes('wechat');
  }
}
