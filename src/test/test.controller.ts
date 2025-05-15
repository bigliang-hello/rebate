import { Controller, Get } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import { TaoService } from "../tao/tao.service";
import { Repository } from "typeorm";

@Controller()
export class TestController {

    constructor(@InjectRepository(User) private usersRepository: Repository<User>, private taoService: TaoService ) {}

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
}