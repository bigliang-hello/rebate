import { Injectable, Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { parseString } from 'xml2js';

@Injectable()
export class WechatService {
    constructor(private configService: ConfigService) {}

    checkSignature(req: Request, res: Response, next: NextFunction) {
        const token = this.configService.get<string>('WECHAT_TOKEN');
        const signature = req.query.signature as string;
        const timestamp = req.query.timestamp as string;
        const nonce = req.query.nonce as string;

        const array = [token, timestamp, nonce].sort();
        const str = array.join('');
        const hash = crypto.createHash('sha1');
        hash.update(str);
        const result = hash.digest('hex');

        if (result === signature) {
            this.parseXml(req, res, next);
        } else {
            res.status(403).send('Forbidden');
        }
    }

    parseXml(req: Request, res: Response, next: NextFunction) {
        const buffer: any[] = [];
        req.on('data', (chunk) => {
            buffer.push(chunk);
        });

        req.on('end', () => {
            const xml = Buffer.concat(buffer).toString('utf-8');
            parseString(xml, { trim: true }, (err, result) => {
                if (err) {
                    Logger.error(err);
                } else {
                    Logger.log(result);
                    const { xml } = result;
                    const { ToUserName, FromUserName, CreateTime, MsgType, Content } = xml;
                    const reply = {
                        ToUserName: FromUserName,
                        FromUserName: ToUserName,
                        CreateTime: Date.now(),
                        MsgType: 'text',
                        Content: 'Hello World!',
                    };
                    res.setHeader('Content-Type', 'application/xml');
                    res.send(this.jsonToXml(reply));
                }
            });
            req.body = xml;
        });
    }

    /// 把json数据转换为微信消息的xml格式
    jsonToXml(json: any) {
        let xml = '<xml>';
        for (const key in json) {
            xml += `<${key}>${json[key]}</${key}>`;
        }
        xml += '</xml>';
        return xml;
    }
}
