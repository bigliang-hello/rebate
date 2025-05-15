import { Module } from "@nestjs/common";
import { TestController } from "./test.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import { TaoModule } from "src/tao/tao.module";

@Module({
    imports: [TypeOrmModule.forFeature([User]), TaoModule],
    controllers: [TestController],
})

export class TestModule {}