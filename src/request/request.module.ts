import { Module } from '@nestjs/common';
import { HttpService } from './index';

@Module({
  providers: [HttpService],
  exports: [HttpService],
})
export class RequestModule {}