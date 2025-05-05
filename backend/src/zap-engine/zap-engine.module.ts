import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZapEngineService } from './zap-engine.service';

@Module({
  imports: [],
  providers: [ZapEngineService],
  exports: [ZapEngineService],
})
export class ZapEngineModule {}
