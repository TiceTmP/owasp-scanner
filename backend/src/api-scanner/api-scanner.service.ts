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
import {FrontendScanOptions, ScanStatus} from './interfaces/scan-result.interface';
import { FrontendScanRequestDto } from './dto/frontend-scan-request.dto';

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

      // สร้าง URL สำหรับ OpenAPI JSON ที่ถูกต้อง
      let apiJsonUrl = scanRequestDto.apiJsonUrl;

      // ตรวจสอบว่า URL เป็น localhost หรือไม่และแก้ไขตามความเหมาะสม
      if (apiJsonUrl.includes('localhost')) {
        // แทนที่ localhost ด้วยชื่อ service ใน docker-compose
        apiJsonUrl = apiJsonUrl.replace('localhost:3030', 'example:3030');
      }

      this.logger.log(`Fetching Swagger document from: ${apiJsonUrl}`);

      // 2. ดึง Swagger JSON จาก URL ที่ได้รับ
      const swaggerDocument = await this.fetchSwaggerDocument(apiJsonUrl);

      // ตรวจสอบความถูกต้องของ Swagger Document
      if (!swaggerDocument || !swaggerDocument.paths) {
        this.logger.error('Invalid Swagger document: missing paths');
        throw new HttpException(
          'Invalid Swagger document',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 3. วิเคราะห์ Swagger และสร้างรายการ endpoints ที่ต้องการสแกน
      const endpoints = this.parseSwaggerForEndpoints(swaggerDocument);

      if (endpoints.length === 0) {
        this.logger.warn('No endpoints found in Swagger document');
      } else {
        this.logger.log(`Found ${endpoints.length} endpoints to scan`);
      }

      // 4. สร้างรายงานเริ่มต้นในฐานข้อมูล
      await this.createInitialReport(scanId, scanRequestDto, endpoints);

      // 5. เริ่มกระบวนการสแกนแบบ asynchronous
      this.startScanProcess(
        scanId,
        scanRequestDto.baseUrl,
        endpoints,
        apiJsonUrl,
      );

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
        `Failed to initiate API scan: ${error.message}`,
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
            : report.status === 'FAILED'
              ? `Scan failed: ${report.errorMessage}`
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
      // เพิ่ม retry logic
      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        try {
          const response = await axios.get(apiJsonUrl, {
            timeout: 10000,
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          });

          // ตรวจสอบว่าได้รับข้อมูล JSON
          if (typeof response.data === 'string') {
            try {
              return JSON.parse(response.data);
            } catch (e) {
              this.logger.error(`Response is not a valid JSON: ${e.message}`);
            }
          }

          return response.data;
        } catch (error) {
          retries++;
          if (retries >= maxRetries) throw error;

          this.logger.warn(
            `Retry ${retries}/${maxRetries} fetching Swagger document`,
          );
          await new Promise((resolve) => setTimeout(resolve, 2000)); // รอ 2 วินาที
        }
      }

      throw new Error('Max retries exceeded');
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

    try {
      // Parse Swagger document for paths and methods
      for (const path in swaggerDocument.paths) {
        for (const method in swaggerDocument.paths[path]) {
          // ข้ามฟิลด์ที่ไม่ใช่ HTTP method
          if (
            ![
              'get',
              'post',
              'put',
              'delete',
              'patch',
              'options',
              'head',
            ].includes(method.toLowerCase())
          ) {
            continue;
          }

          const endpointInfo = swaggerDocument.paths[path][method];

          // ตรวจสอบว่า endpointInfo เป็น object
          if (typeof endpointInfo !== 'object' || Array.isArray(endpointInfo)) {
            this.logger.warn(
              `Invalid endpoint info for ${method.toUpperCase()} ${path}`,
            );
            continue;
          }

          endpoints.push({
            path,
            method: method.toUpperCase(),
            parameters: endpointInfo.parameters || [],
          });
        }
      }
    } catch (error) {
      this.logger.error(
        `Error parsing Swagger for endpoints: ${error.message}`,
      );
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
    swaggerJsonUrl: string,
  ): Promise<void> {
    // Start asynchronous scan process
    setTimeout(async () => {
      try {
        // 1. เริ่มต้น ZAP Engine
        await this.zapEngineService.initializeZap();

        // 2. วิธีที่ 1: ใช้ OpenAPI scan แทนการสแกนทีละ endpoint
        try {
          this.logger.log(
            `Starting API scan using OpenAPI definition from ${swaggerJsonUrl}`,
          );
          const vulnerabilities =
            await this.zapEngineService.scanApiWithOpenApi(swaggerJsonUrl);
          await this.updateReportWithResults(scanId, vulnerabilities);
          return;
        } catch (error) {
          this.logger.error(
            `OpenAPI scan failed, falling back to endpoint scanning: ${error.message}`,
          );
          // จะทำการ fallback ไปใช้วิธีที่ 2 (สแกนทีละ endpoint)
        }

        // 2. วิธีที่ 2: ทำการสแกนแต่ละ endpoint (fallback)
        const vulnerabilities: any[] = [];

        for (const endpoint of endpoints) {
          try {
            // สร้าง URL ที่ต้องการทดสอบ
            const targetUrl = `${baseUrl}${endpoint.path}`;

            this.logger.log(
              `Scanning endpoint ${targetUrl} with method ${endpoint.method}`,
            );

            // ทำการสแกนด้วย ZAP
            const results = await this.zapEngineService.scanEndpoint(
              targetUrl,
              endpoint.method,
              endpoint.parameters,
              swaggerJsonUrl, // ส่ง URL ของ Swagger JSON ไปด้วย
            );

            // เพิ่มผลลัพธ์ลงในรายการช่องโหว่
            vulnerabilities.push(...results);
          } catch (error) {
            this.logger.error(
              `Error scanning endpoint ${endpoint.path}: ${error.message}`,
            );
            // ทำการ continue เพื่อสแกน endpoint ต่อไป แม้ว่า endpoint นี้จะล้มเหลว
          }
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
    this.logger.log(
      `Scan ${scanId} completed with ${vulnerabilities.length} vulnerabilities found`,
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
    this.logger.error(`Scan ${scanId} failed: ${errorMessage}`);
  }

  async scanFrontend(
    frontendScanRequestDto: FrontendScanRequestDto,
  ): Promise<ScanResponseDto> {
    try {
      // 1. สร้าง ID สำหรับการสแกนครั้งนี้
      const scanId = uuidv4();

      // 2. สร้าง URL สำหรับ Frontend ที่ถูกต้อง
      let frontendUrl = frontendScanRequestDto.frontendUrl;

      this.logger.log(`เริ่มสแกนเว็บไซต์ frontend: ${frontendUrl}`);

      // 3. สร้างรายงานเริ่มต้นในฐานข้อมูล
      await this.createInitialFrontendReport(scanId, frontendScanRequestDto);

      // 4. เริ่มกระบวนการสแกนแบบ asynchronous
      this.startFrontendScanProcess(
        scanId,
        frontendUrl,
        frontendScanRequestDto,
      );

      return {
        scanId,
        status: 'PENDING',
        message:
          'การสแกนเว็บไซต์ frontend ได้เริ่มต้นแล้ว โปรดตรวจสอบผลลัพธ์ด้วยรหัสการสแกนที่ได้รับ',
        completedAt: null,
        vulnerabilities: [],
      };
    } catch (error) {
      this.logger.error(
        `เกิดข้อผิดพลาดในการสแกนเว็บไซต์ frontend: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        `ไม่สามารถเริ่มการสแกนเว็บไซต์ frontend ได้: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async createInitialFrontendReport(
    scanId: string,
    frontendScanRequestDto: FrontendScanRequestDto,
  ): Promise<Report> {
    const report = new Report();
    report.scanId = scanId;
    report.apiJsonUrl = ''; // ไม่มี API JSON URL สำหรับการสแกน frontend
    report.baseUrl = frontendScanRequestDto.frontendUrl;
    report.status = 'PENDING';
    report.endpoints = [];
    report.startedAt = new Date();
    report.vulnerabilities = [];
    report.scanOptions = {
      enableActiveScan: true,
      enablePassiveScan: true,
      minimumRiskLevel: frontendScanRequestDto.minimumRiskLevel || 'Low',
      ...frontendScanRequestDto.scanOptions,
    };

    return this.reportsRepository.save(report);
  }

  private async startFrontendScanProcess(
    scanId: string,
    frontendUrl: string,
    frontendScanRequestDto: FrontendScanRequestDto,
  ): Promise<void> {
    // เริ่มกระบวนการสแกนแบบ asynchronous
    setTimeout(async () => {
      try {
        // 1. อัปเดตสถานะเป็น "กำลังดำเนินการ"
        await this.reportsRepository.update(
          { scanId },
          { status: 'IN_PROGRESS' },
        );

        // 2. เริ่มต้น ZAP Engine
        await this.zapEngineService.initializeZap();

        // 3. ทำการสแกนเว็บไซต์ frontend
        const scanOptions: FrontendScanOptions = {
          scanDepth: frontendScanRequestDto.scanDepth || 'standard',
          minimumRiskLevel: frontendScanRequestDto.minimumRiskLevel || 'Low',
          authentication: frontendScanRequestDto.authentication,
          sameHostOnly: frontendScanRequestDto.scanOptions?.sameHostOnly,
          maxDuration: frontendScanRequestDto.scanOptions?.maxDuration,
        };

        const vulnerabilities = await this.zapEngineService.scanFrontendWebsite(
          frontendUrl,
          scanOptions,
        );

        // 4. อัปเดตรายงานในฐานข้อมูล
        await this.updateReportWithResults(scanId, vulnerabilities);
      } catch (error) {
        this.logger.error(
          `เกิดข้อผิดพลาดระหว่างกระบวนการสแกน frontend: ${error.message}`,
          error.stack,
        );
        await this.updateReportWithError(scanId, error.message);
      }
    }, 0);
  }
}
