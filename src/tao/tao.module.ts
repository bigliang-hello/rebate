import { Module } from '@nestjs/common';
import { RequestModule } from '../request/request.module';
import { TaoService } from './tao.service';

@Module({
    imports: [
      RequestModule,
    ],
    providers: [TaoService],
    exports: [TaoService],
})

export class TaoModule {}
