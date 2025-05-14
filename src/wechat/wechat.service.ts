import { Injectable, Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WechatService {
    constructor(private configService: ConfigService) {}

    checkSignature(req: Request, res: Response, next: NextFunction) {
        const token = this.configService.get<string>('WECHAT_TOKEN');
        const signature = req.query.signature as string;
        const timestamp = req.query.timestamp as string;
        const nonce = req.query.nonce as string;
        const echostr = req.query.echostr as string;

        const array = [token, timestamp, nonce].sort();
        const str = array.join('');
        const hash = crypto.createHash('sha1');
        hash.update(str);
        const result = hash.digest('hex');

        if (result === signature) {
            res.send(echostr);
        } else {
            res.status(403).send('Forbidden');
        }
    }
}
