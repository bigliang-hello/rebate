import { Module } from '@nestjs/common';
import { RequestModule } from '../request/request.module';
import { TaoService } from './tao.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from '../entities/record.entity';

@Module({
    imports: [
      RequestModule,
      TypeOrmModule.forFeature([Record])
    ],
    providers: [TaoService],
    exports: [TaoService],
})

export class TaoModule {}
