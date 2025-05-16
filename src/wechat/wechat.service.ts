import { Injectable, Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { parseString } from 'xml2js';
import { WechatEventType, WechatMsgType } from './wechat.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { TaoService } from '../tao/tao.service';

@Injectable()
export class WechatService {
    constructor(private configService: ConfigService, private readonly taoService: TaoService, 
        @InjectRepository(User) 
        private usersRepository: Repository<User>) {}

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
            if (req.method == 'GET') {
                res.send(echostr);
            } else {
                this.parseXml(req, res, next);
            }
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
            parseString(xml, { trim: true }, async (err, result) => {
                if (err) {
                    Logger.error(err);
                } else {
                    const { xml } = result;
                    
                    const { FromUserName, MsgType, Content, EventKey, Event } = xml;
                    if (MsgType == WechatMsgType.TEXT) {
                        
                        const content = this.handleTextMessage(Content);
                        this.sendMessage(res, xml, content);
                        this.usersRepository.findOne({
                            where: {
                                openid: FromUserName,
                            },
                        });

                    } else if (MsgType == WechatMsgType.EVENT){
                        
                        if (Event == WechatEventType.SUBSCRIBE) { //关注
                            

                        } else if (Event == WechatEventType.UNSUBSCRIBE) { //取消关注

                        } else if (Event == WechatEventType.CLICK) { //点击菜单
                            if (EventKey == 'unnamed_ele_key') { 
                                const token = await this.taoService.getEleToken(FromUserName);
                                if (token) {
                                    this.sendMessage(res, xml, '饿了么天天领红包:'+token);
                                }
                            } else if (EventKey == 'unnamed_mei_key') {
                                const token = await this.taoService.getMeiToken(FromUserName);
                                if (token) {
                                    this.sendMessage(res, xml, '美团外卖红包:'+token);
                                }
                            }
                        }
                        
                    } else {
                        res.send('');
                    }

                    
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

    /// 发送微信消息
    sendMessage(res: Response, payload: any, content: string) {
        const { ToUserName, FromUserName } = payload;
        const reply = {
            ToUserName: FromUserName,
            FromUserName: ToUserName,
            CreateTime: Date.now(),
            MsgType: WechatMsgType.TEXT,
            Content: content,
        };
        res.setHeader('Content-Type', 'application/xml');
        res.send(this.jsonToXml(reply));
    }

    /// 处理微信文本消息
    handleTextMessage(content: string) :string {
        return '11';
    }

    /// 获取商品token
    private async getTaoToken() {
        
    }
}
