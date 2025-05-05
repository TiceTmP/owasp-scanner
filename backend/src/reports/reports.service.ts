import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as PDFDocument from 'pdfkit';
import { Report } from './entities/report.entity';
import { ScanResponseDto } from '../api-scanner/dto/scan-response.dto';
import { Vulnerability } from '../api-scanner/interfaces/scan-result.interface';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
  ) {}

  /**
   * ดึงรายงานการสแกนล่าสุด
   * @returns รายการรายงานการสแกนล่าสุด
   */
  async getRecentReports(): Promise<ScanResponseDto[]> {
    try {
      // ดึงรายงาน 10 รายการล่าสุด
      const reports = await this.reportsRepository.find({
        order: { startedAt: 'DESC' },
        take: 10,
      });

      // แปลงรายงานเป็น DTO
      return reports.map((report) => this.convertToDto(report));
    } catch (error) {
      this.logger.error(
        `Error fetching recent reports: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * ดึงรายงานตาม ID
   * @param scanId รหัสการสแกน
   * @returns รายงานการสแกน
   */
  async getReportById(scanId: string): Promise<ScanResponseDto> {
    try {
      const report = await this.reportsRepository.findOne({
        where: { scanId },
      });

      if (!report) {
        throw new NotFoundException(`Report with scan ID ${scanId} not found`);
      }

      return this.convertToDto(report);
    } catch (error) {
      this.logger.error(
        `Error fetching report ${scanId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * สร้างรายงาน PDF
   * @param scanId รหัสการสแกน
   * @returns buffer ของไฟล์ PDF และชื่อไฟล์
   */
  async generatePdfReport(
    scanId: string,
  ): Promise<{ buffer: Buffer; filename: string }> {
    try {
      // ดึงข้อมูลรายงาน
      const report = await this.reportsRepository.findOne({
        where: { scanId },
      });

      if (!report) {
        throw new NotFoundException(`Report with scan ID ${scanId} not found`);
      }

      // ตรวจสอบว่าสแกนเสร็จสิ้นแล้ว
      if (report.status !== 'COMPLETED') {
        throw new Error(
          `Cannot generate PDF for scan that is not completed. Current status: ${report.status}`,
        );
      }

      // สร้าง PDF
      const pdfBuffer = await this.createPdf(report);
      const filename = `owasp-api-scan-${scanId}.pdf`;

      return { buffer: pdfBuffer, filename };
    } catch (error) {
      this.logger.error(
        `Error generating PDF for scan ${scanId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * สร้างรายงานสถิติ
   * @returns ข้อมูลสถิติการสแกน
   */
  async getStats() {
    try {
      // นับจำนวนการสแกนทั้งหมด
      const totalScans = await this.reportsRepository.count();

      // นับจำนวนการสแกนตามสถานะ
      const completedScans = await this.reportsRepository.count({
        where: { status: 'COMPLETED' },
      });
      const failedScans = await this.reportsRepository.count({
        where: { status: 'FAILED' },
      });

      // ข้อมูลช่องโหว่
      let totalVulnerabilities = 0;
      let criticalVulnerabilities = 0;
      let highVulnerabilities = 0;
      let mediumVulnerabilities = 0;
      let lowVulnerabilities = 0;

      // นับช่องโหว่ตามระดับความเสี่ยง
      const completedReports = await this.reportsRepository.find({
        where: { status: 'COMPLETED' },
      });

      // Map เก็บจำนวนช่องโหว่แต่ละประเภท
      const vulnerabilityCount = new Map<string, number>();

      for (const report of completedReports) {
        if (report.vulnerabilities && report.vulnerabilities.length > 0) {
          totalVulnerabilities += report.vulnerabilities.length;

          for (const vuln of report.vulnerabilities) {
            // นับตามระดับความเสี่ยง
            const risk = vuln.risk.toLowerCase();
            if (risk === 'critical') criticalVulnerabilities++;
            else if (risk === 'high') highVulnerabilities++;
            else if (risk === 'medium') mediumVulnerabilities++;
            else if (risk === 'low') lowVulnerabilities++;

            // นับตามชื่อช่องโหว่
            const vulnName = vuln.name;
            const count = vulnerabilityCount.get(vulnName) || 0;
            vulnerabilityCount.set(vulnName, count + 1);
          }
        }
      }

      // ช่องโหว่ที่พบบ่อยที่สุด (เรียงลำดับจากมากไปน้อย)
      const mostCommonVulnerabilities = [...vulnerabilityCount.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      return {
        totalScans,
        completedScans,
        failedScans,
        totalVulnerabilities,
        criticalVulnerabilities,
        highVulnerabilities,
        mediumVulnerabilities,
        lowVulnerabilities,
        mostCommonVulnerabilities,
      };
    } catch (error) {
      this.logger.error(
        `Error generating stats: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * สร้างไฟล์ PDF สำหรับรายงาน
   * @param report รายงานการสแกน
   * @returns buffer ของไฟล์ PDF
   */
  private async createPdf(report: Report): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const chunks: Buffer[] = [];
        const doc = new PDFDocument({ margin: 50 });

        // รวบรวม chunks ของข้อมูล PDF
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // ส่วนหัวของรายงาน
        doc
          .fontSize(25)
          .text('OWASP API Security Scan Report', { align: 'center' });
        doc.moveDown();

        // ข้อมูลการสแกน
        doc.fontSize(14).text('Scan Information', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text(`Scan ID: ${report.scanId}`);
        doc.fontSize(12).text(`Status: ${report.status}`);
        doc.fontSize(12).text(`Base URL: ${report.baseUrl}`);
        doc.fontSize(12).text(`Swagger URL: ${report.apiJsonUrl}`);
        doc
          .fontSize(12)
          .text(`Started at: ${report.startedAt.toLocaleString()}`);
        doc
          .fontSize(12)
          .text(
            `Completed at: ${report.completedAt ? report.completedAt.toLocaleString() : 'N/A'}`,
          );
        doc.moveDown();

        // สรุปผลการสแกน
        doc.fontSize(14).text('Summary', { underline: true });
        doc.moveDown(0.5);

        if (!report.vulnerabilities || report.vulnerabilities.length === 0) {
          doc
            .fontSize(12)
            .text('No vulnerabilities were found.', { align: 'center' });
          doc.moveDown();
        } else {
          // นับช่องโหว่ตามระดับความเสี่ยง
          const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };

          for (const vuln of report.vulnerabilities) {
            const risk = vuln.risk.toLowerCase();
            if (risk === 'critical') counts.critical++;
            else if (risk === 'high') counts.high++;
            else if (risk === 'medium') counts.medium++;
            else if (risk === 'low') counts.low++;
            else counts.info++;
          }

          doc
            .fontSize(12)
            .text(
              `Total vulnerabilities found: ${report.vulnerabilities.length}`,
            );
          doc.fontSize(12).text(`Critical: ${counts.critical}`);
          doc.fontSize(12).text(`High: ${counts.high}`);
          doc.fontSize(12).text(`Medium: ${counts.medium}`);
          doc.fontSize(12).text(`Low: ${counts.low}`);
          doc.fontSize(12).text(`Informational: ${counts.info}`);
          doc.moveDown();

          // รายละเอียดของแต่ละช่องโหว่
          doc.fontSize(14).text('Vulnerability Details', { underline: true });
          doc.moveDown(0.5);

          // เรียงลำดับช่องโหว่ตามระดับความเสี่ยง
          const sortedVulns = [...report.vulnerabilities].sort((a, b) => {
            const riskOrder = {
              critical: 0,
              high: 1,
              medium: 2,
              low: 3,
              informational: 4,
            };
            const riskA = a.risk.toLowerCase();
            const riskB = b.risk.toLowerCase();
            return (riskOrder[riskA] || 99) - (riskOrder[riskB] || 99);
          });

          for (let i = 0; i < sortedVulns.length; i++) {
            const vuln = sortedVulns[i];

            // เพิ่มหน้าใหม่หลังจากแต่ละช่องโหว่ (ยกเว้นช่องโหว่สุดท้าย)
            if (i > 0) {
              doc.addPage();
            }

            // ชื่อช่องโหว่
            doc
              .fontSize(14)
              .fillColor('red')
              .text(`${i + 1}. ${vuln.name} (${vuln.risk})`);
            doc.moveDown(0.5);

            // รายละเอียดช่องโหว่
            doc.fontSize(12).fillColor('black').text(`Risk: ${vuln.risk}`);
            doc.fontSize(12).text(`Confidence: ${vuln.confidence}`);
            doc.fontSize(12).text(`CWE ID: ${vuln.cweid || 'N/A'}`);
            doc.fontSize(12).text(`WASC ID: ${vuln.wascid || 'N/A'}`);
            doc.moveDown(0.5);

            doc.fontSize(12).fillColor('blue').text('URL:');
            doc.fontSize(10).fillColor('black').text(vuln.url);
            doc.moveDown(0.5);

            if (vuln.parameter) {
              doc.fontSize(12).fillColor('blue').text('Parameter:');
              doc.fontSize(10).fillColor('black').text(vuln.parameter);
              doc.moveDown(0.5);
            }

            doc.fontSize(12).fillColor('blue').text('Description:');
            doc.fontSize(10).fillColor('black').text(vuln.description);
            doc.moveDown(0.5);

            doc.fontSize(12).fillColor('blue').text('Solution:');
            doc.fontSize(10).fillColor('black').text(vuln.solution);
            doc.moveDown(0.5);

            if (vuln.evidence) {
              doc.fontSize(12).fillColor('blue').text('Evidence:');
              doc.fontSize(10).fillColor('black').text(vuln.evidence);
              doc.moveDown(0.5);
            }

            if (vuln.reference) {
              doc.fontSize(12).fillColor('blue').text('References:');
              const references = vuln.reference.split('\n');
              for (const ref of references) {
                doc.fontSize(10).fillColor('black').text(ref.trim());
              }
            }
          }
        }

        // ส่วนท้ายของรายงาน
        doc.addPage();
        doc.fontSize(14).text('Disclaimer', { underline: true });
        doc.moveDown(0.5);
        doc
          .fontSize(10)
          .text(
            'This report was generated automatically by OWASP API Scanner. ' +
              'The findings in this report are based on automated testing and may contain false positives. ' +
              'It is recommended to verify the findings manually before taking any corrective action. ' +
              'This tool does not guarantee the identification of all security vulnerabilities in the target API.',
          );
        doc.moveDown();
        doc
          .fontSize(10)
          .text(`Report generated on: ${new Date().toLocaleString()}`);

        // จบการสร้าง PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * แปลงข้อมูลรายงานเป็น DTO
   * @param report ข้อมูลรายงานจากฐานข้อมูล
   * @returns ข้อมูลรายงานในรูปแบบ DTO
   */
  private convertToDto(report: Report): ScanResponseDto {
    return {
      scanId: report.scanId,
      status: report.status as
        | 'PENDING'
        | 'IN_PROGRESS'
        | 'COMPLETED'
        | 'FAILED',
      message: this.getStatusMessage(report.status, report.errorMessage),
      apiJsonUrl: report.apiJsonUrl,
      baseUrl: report.baseUrl,
      startedAt: report.startedAt,
      completedAt: report.completedAt,
      vulnerabilities: (report.vulnerabilities as Vulnerability[]) || [],
    };
  }

  /**
   * สร้างข้อความสถานะตามสถานะการสแกน
   * @param status สถานะการสแกน
   * @param errorMessage ข้อความข้อผิดพลาด (ถ้ามี)
   * @returns ข้อความสถานะ
   */
  private getStatusMessage(status: string, errorMessage?: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'Scan completed successfully';
      case 'FAILED':
        return errorMessage || 'Scan failed';
      case 'IN_PROGRESS':
        return 'Scan is in progress';
      case 'PENDING':
        return 'Scan is pending';
      default:
        return status;
    }
  }
}
