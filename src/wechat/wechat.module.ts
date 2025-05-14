import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { WechatService } from './wechat.service';
import { WechatController } from './wechat.controller';
import { WechatMiddleware } from './wechat.middleware';
import { RequestModule } from 'src/request/request.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [
    RequestModule,
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
