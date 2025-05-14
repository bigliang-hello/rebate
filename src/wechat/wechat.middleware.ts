import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WechatService } from './wechat.service';

@Injectable()
export class WechatMiddleware implements NestMiddleware {
  constructor(private readonly wechatService: WechatService) {}

  use(req: Request, res: Response, next: NextFunction) {
    this.wechatService.checkSignature(req, res, next);
  }
}