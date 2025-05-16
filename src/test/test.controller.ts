import { Controller, Get } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import { TaoService } from "../tao/tao.service";
import { Repository } from "typeorm";

@Controller('test')
export class TestController {

  constructor(@InjectRepository(User) private usersRepository: Repository<User>, private taoService: TaoService) { }

  @Get('ele')
  async getEle() {
    const token = await this.taoService.getEleToken('1');
    return token;
  }

  @Get('mei')
  async getMei() {
    const token = await this.taoService.getMeiToken('1');
    return token;
  }

  @Get('jd')
  async getJd() {
    const token = await this.taoService.getJdToken();
    return token;
  }

  @Get('menu')
  async createMenu() {
    const menus = [
      {
        "name": "外卖红包",
        "sub_button": [
          {
            "type": "click",
            "name": "饿了么红包",
            "key": "unnamed_ele_key"
          },
          {
            "type": "click",
            "name": "美团红包",
            "key": "unnamed_mei_key"
          },
          {
            "type": "click",
            "name": "京东红包",
            "key": "unnamed_jd_key"
          },
        ]
      },
      // {
      //     "name"       : "个人中心",
      //     "sub_button" : [
      //       {
      //             "type" : "view",
      //             "name" : "个人中心",
      //             "url"  : config('app.url').'/unnamed/person'
      //           },
      //         {
      //             "type" : "view",
      //             "name" : "我的订单",
      //             "url"  : config('app.url').'/unnamed/orders'
      //           },
      //         {
      //             "type" : "view",
      //             "name" : "使用说明",
      //             "url"  : config('app.url').'/unnamed/desc'
      //           },
      //         {
      //             "type" : "click",
      //             "name" : "备案(仅一次)",
      //             "key"  : "unnamed_record_key"
      //           },
      //     ],
      // },

    ];
    this.taoService.createMenus({
      button: menus
    });
    return 'ok';
  }
}