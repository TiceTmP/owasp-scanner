import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { ScanRequestDto } from './dto/scan-request.dto';
import { ScanResponseDto } from './dto/scan-response.dto';
import { Report } from '../reports/entities/report.entity';
import { SwaggerDocument } from './interfaces/swagger-document.interface';
import { ZapEngineService } from '../zap-engine/zap-engine.service';
import { ScanStatus } from './interfaces/scan-result.interface';

@Injectable()
export class ApiScannerService {
  private readonly logger = new Logger(ApiScannerService.name);

  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
    private readonly zapEngineService: ZapEngineService,
  ) {}

  async scanApi(scanRequestDto: ScanRequestDto): Promise<ScanResponseDto> {
    try {
      // 1. สร้าง ID สำหรับการสแกนครั้งนี้
      const scanId = uuidv4();

      // 2. ดึง Swagger JSON จาก URL ที่ได้รับ
      const swaggerDocument = await this.fetchSwaggerDocument(
        scanRequestDto.apiJsonUrl,
      );

      // 3. วิเคราะห์ Swagger และสร้างรายการ endpoints ที่ต้องการสแกน
      const endpoints = this.parseSwaggerForEndpoints(swaggerDocument);

      // 4. สร้างรายงานเริ่มต้นในฐานข้อมูล
      const report = await this.createInitialReport(
        scanId,
        scanRequestDto,
        endpoints,
      );

      // 5. เริ่มกระบวนการสแกนแบบ asynchronous
      this.startScanProcess(scanId, scanRequestDto.baseUrl, endpoints);

      return {
        scanId,
        status: 'PENDING',
        message:
          'Scan has been initiated. Check the results with the provided scanId.',
        completedAt: null,
        vulnerabilities: [],
      };
    } catch (error) {
      this.logger.error(`Error scanning API: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to initiate API scan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getScanResultsById(scanId: string): Promise<ScanResponseDto> {
    try {
      const report = await this.reportsRepository.findOne({
        where: { scanId },
      });

      if (!report) {
        throw new HttpException('Scan not found', HttpStatus.NOT_FOUND);
      }

      return {
        scanId: report.scanId,
        status: ScanStatus[report.status],
        message:
          report.status === 'COMPLETED'
            ? 'Scan completed successfully'
            : 'Scan is still in progress',
        completedAt: report.completedAt,
        vulnerabilities: report.vulnerabilities || [],
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `Error fetching scan results: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Failed to fetch scan results',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async fetchSwaggerDocument(
    apiJsonUrl: string,
  ): Promise<SwaggerDocument> {
    try {
      const response = await axios.get(apiJsonUrl);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Error fetching Swagger document: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Failed to fetch Swagger document',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private parseSwaggerForEndpoints(swaggerDocument: SwaggerDocument): any[] {
    const endpoints: any[] = [];

    // Parse Swagger document for paths and methods
    for (const path in swaggerDocument.paths) {
      for (const method in swaggerDocument.paths[path]) {
        endpoints.push({
          path,
          method: method.toUpperCase(),
          parameters: swaggerDocument.paths[path][method].parameters || [],
        });
      }
    }

    return endpoints;
  }

  private async createInitialReport(
    scanId: string,
    scanRequestDto: ScanRequestDto,
    endpoints: any[],
  ): Promise<Report> {
    const report = new Report();
    report.scanId = scanId;
    report.apiJsonUrl = scanRequestDto.apiJsonUrl;
    report.baseUrl = scanRequestDto.baseUrl;
    report.status = 'PENDING';
    report.endpoints = endpoints;
    report.startedAt = new Date();
    report.vulnerabilities = [];

    return this.reportsRepository.save(report);
  }

  private async startScanProcess(
    scanId: string,
    baseUrl: string,
    endpoints: any[],
  ): Promise<void> {
    // Start asynchronous scan process
    setTimeout(async () => {
      try {
        // 1. เริ่มต้น ZAP Engine
        await this.zapEngineService.initializeZap();

        // 2. ทำการสแกนแต่ละ endpoint
        const vulnerabilities: any[] = [];

        for (const endpoint of endpoints) {
          // สร้าง URL ที่ต้องการทดสอบ
          const targetUrl = `${baseUrl}${endpoint.path}`;

          // ทำการสแกนด้วย ZAP
          const results = await this.zapEngineService.scanEndpoint(
            targetUrl,
            endpoint.method,
            endpoint.parameters,
          );

          // เพิ่มผลลัพธ์ลงในรายการช่องโหว่
          vulnerabilities.push(...results);
        }

        // 3. อัพเดทรายงานในฐานข้อมูล
        await this.updateReportWithResults(scanId, vulnerabilities);
      } catch (error) {
        this.logger.error(
          `Error during scan process: ${error.message}`,
          error.stack,
        );
        await this.updateReportWithError(scanId, error.message);
      }
    }, 0);
  }

  private async updateReportWithResults(
    scanId: string,
    vulnerabilities: any[],
  ): Promise<void> {
    await this.reportsRepository.update(
      { scanId },
      {
        status: 'COMPLETED',
        completedAt: new Date(),
        vulnerabilities,
      },
    );
  }

  private async updateReportWithError(
    scanId: string,
    errorMessage: string,
  ): Promise<void> {
    await this.reportsRepository.update(
      { scanId },
      {
        status: 'FAILED',
        completedAt: new Date(),
        errorMessage,
      },
    );
  }
}
