import { Controller } from '@nestjs/common';
import { WechatService } from './wechat.service';

@Controller('wechat')
export class WechatController {
  constructor(private readonly wechatService: WechatService) {}
}
