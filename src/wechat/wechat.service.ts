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
import { Record } from 'src/entities/record.entity';
import { max } from 'rxjs';

@Injectable()
export class WechatService {
    constructor(private configService: ConfigService, private readonly taoService: TaoService,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Record)
        private recordsRepository: Repository<Record>,
    ) { }

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
                        const content = await this.handleTextMessage(Content, FromUserName);
                        this.sendMessage(res, xml, content);
                    } else if (MsgType == WechatMsgType.EVENT) {
                        if (Event == WechatEventType.SUBSCRIBE) { //关注
                            this.sendMessage(res, xml, '欢迎关注');
                        } else if (Event == WechatEventType.UNSUBSCRIBE) { //取消关注

                        } else if (Event == WechatEventType.CLICK) { //点击菜单
                            if (EventKey == 'unnamed_ele_key') {
                                const token = await this.taoService.getEleToken(FromUserName);
                                if (token) {
                                    this.sendMessage(res, xml, '饿了么外卖红包:' + token);
                                }
                            } else if (EventKey == 'unnamed_mei_key') {
                                const token = await this.taoService.getMeiToken(FromUserName);
                                if (token) {
                                    this.sendMessage(res, xml, '美团外卖红包:' + token);
                                }
                            } else if (EventKey == 'unnamed_jd_key') {
                                const token = await this.taoService.getJdToken();
                                if (token) {
                                    this.sendMessage(res, xml, '京东外卖红包:' + token);
                                }
                            } else {
                                res.send('');
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
    async handleTextMessage(content: string, openId: string): Promise<string> {
        //发消息关联用户信息
        let user = await this.usersRepository.findOne({
            where: {
                openid: openId
            }
        });

        if (!user) {
            await this.recordsRepository.manager.transaction(async (transactionalEntityManager) => {
                const record = await transactionalEntityManager.findOne(Record, {
                    where: {
                        is_use: false
                    }
                })
                if (record) {
                    user = await transactionalEntityManager.save(User, {
                        openid: openId,
                        relation_id: record.relation_id,
                        pid: record.pid,
                    });
                    record.is_use = true;
                    await transactionalEntityManager.save(Record, record);
                }
            })
        }
        if (user) {
            if (content.includes('jd.com') || content.includes('https://3.cn') || content.includes('【京东】')) {
                return 'jd';
            } else {
                const res = await this.taoService.getCoupon(content, user.relation_id, user.pid);
                return await this.getUserMessage(res, user);
            }
        }
        return '未关联用户';
    }

    /// 获取商品token
    private async getUserMessage(res: any, user: User): Promise<string> {
        try {
            //有券
            if (res.coupon_amount != '' || res.s_coupon_amount != '') {
                const coupon = Math.max(parseFloat(res.coupon_amount), parseFloat(res.s_coupon_amount));
                const price = parseFloat(res.zk_final_price);
                let back = 0.0;
                if (price > coupon) {
                    back = parseFloat((parseFloat(res.min_commission_rate) / 100.0 * (price - coupon) * 0.7).toFixed(2));
                } else {
                    back = parseFloat((parseFloat(res.min_commission_rate) / 100.0 * price * 0.7).toFixed(2));
                }
                //淘口令
                const token = await this.taoService.getToken(res.title, res.coupon_click_url);
                return "1/:gift" + res.title + "\n/:rose【在售价】" + price + "元\n/:heart【优惠券】" + coupon + "元\n/:cake【预计返利】" + back + "元\n复制这条信息\n1" + token + ":// HU7679 打开【手机TaoBao】，即可查看/";
            } else {
                //无券
                const click_url = res.item_url + "&relationId=" + user.relation_id + "&pid=" + user.pid;
                const token = await this.taoService.getToken(res.title, click_url);
                const back = parseFloat((parseFloat(res.min_commission_rate) / 100.0 * parseFloat(res.zk_final_price) * 0.7).toFixed(2));
                return "1/:gift" + res.title + "\n/:rose【在售价】" + res.zk_final_price + "元\n/:heart【预计返利】" + back + "元\n复制这条信息\n1" + token + ":// HU7679 打开【手机TaoBao】，即可查看/";
            }
        } catch (error) {
            return "";
        }
        
    }
}
