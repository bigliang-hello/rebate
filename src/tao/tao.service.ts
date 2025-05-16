import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "src/request/request.service";
import { taoConfig } from "./tao.config";
import { ConfigService } from "@nestjs/config";
import { Record } from "src/entities/record.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { create } from "domain";

@Injectable()
export class TaoService {
    constructor(private httpService: HttpService, private configService: ConfigService,
        @InjectRepository(Record)
        private recordsRepository: Repository<Record>
    ) {}

    async getEleToken(openid: string): Promise<string | undefined>  {
        const data = await this.httpService.get(taoConfig.eleme_api, {
            activity_id: '10144',
            customer_id: openid
        })
        Logger.log(data);
        return data.alibaba_alsc_union_eleme_promotion_officialactivity_get_response.data.link.h5_short_link;
    }

    async getMeiToken(openid: string): Promise<string | undefined>  {
        const data = await this.httpService.get(taoConfig.meituan_api, {
            actId: '33',
            linkType: '1',
            customer_id: openid
        })
        Logger.log(data);
        return data.data;
    }

    async getJdToken(): Promise<string | undefined>  {
        const content = await this.httpService.get(taoConfig.jd_api, {
            unionId: this.configService.get('JD_UID'),
            materialId: 'https://pro.m.jd.com/mall/active/4CJH74pqm4snemxqc2TBUJpZe9JQ/index.html?cu=true&utm_source=lianmeng__10__kong&utm_medium=jingfen&utm_campaign=t_2015043138_2037jutuike123456&utm_term=30d44b420746446d93f7462991bde5b7&addressID=0&provinceCode=1&province=&cityCode=&city=&districtCode=&district=&townCode=0&town='
        })
        const resultStr = content.jd_union_open_promotion_byunionid_get_response.result;
        const result = JSON.parse(resultStr);
        Logger.log(result);
        return result.data.shortURL;
    }

    // 获取记录 https://www.zhetaoke.com/user/open/open_sc_publisher_get.aspx
    async getRecords() {
        const data = await this.httpService.get(taoConfig.record_api, {
            relation_app: 'common',
            info_type: '1',
            page: 0,
            page_size: 100
        })  
        const relations = data.tbk_sc_publisher_info_get_response.data.inviter_list.map_data;
        const pids: [string] = data.tbk_sc_publisher_info_get_response.data.root_pid_channel_list.string;
        const records: any[] = [];
        // this.recordsRepository.clear();
        for (const pid of pids) {
            for (const relation of relations) {
                records.push({
                    pid: pid,
                    relation_id: relation.relation_id,
                    create_date: relation.create_date
                })
            }
        }
        this.recordsRepository.save(records);
    }

    async createMenus(menus: any) {
        const api = taoConfig.wechat_access_token_api + '?grant_type=client_credential&appid='+this.configService.get('WECHAT_APP_ID')+'&secret='+this.configService.get('WECHAT_APP_SECRET');
        const data = await this.httpService.get(api);
        Logger.log(data);
        const data1 = await this.httpService.get(taoConfig.wechat_delete_menu_api+'?access_token='+data.access_token);
        Logger.log(data1);
        Logger.log(menus);
        const data2 = await this.httpService.post(taoConfig.wechat_create_menu_api+'?access_token='+data.access_token, menus);
        Logger.log(data2);
    }


}