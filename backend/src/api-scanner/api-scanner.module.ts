import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiScannerController } from './api-scanner.controller';
import { ApiScannerService } from './api-scanner.service';
import { Report } from '../reports/entities/report.entity';
import { ZapEngineService } from '../zap-engine/zap-engine.service';

@Module({
  imports: [TypeOrmModule.forFeature([Report])],
  controllers: [ApiScannerController],
  providers: [ApiScannerService, ZapEngineService],
  exports: [ApiScannerService],
})
export class ApiScannerModule {}
