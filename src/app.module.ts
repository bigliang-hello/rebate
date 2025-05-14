import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { WechatModule } from './wechat/wechat.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }), WechatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
