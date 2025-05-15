import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "src/request/request.service";
import { taoConfig } from "./tao.config";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class TaoService {
    constructor(private httpService: HttpService, private configService: ConfigService) {}

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
}