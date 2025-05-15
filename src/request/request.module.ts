import { Module } from '@nestjs/common';
import { HttpService } from './request.service';

@Module({
  providers: [HttpService],
  exports: [HttpService],
})
export class RequestModule {}