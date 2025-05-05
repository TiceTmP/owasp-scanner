import { Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';
import { ScanResponseDto } from '../api-scanner/dto/scan-response.dto';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('recent')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get recent scan reports' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of recent scan reports',
    type: [ScanResponseDto],
  })
  async getRecentReports(): Promise<ScanResponseDto[]> {
    return this.reportsService.getRecentReports();
  }

  @Get(':id/download')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Download scan report as PDF' })
  @ApiParam({ name: 'id', description: 'The scan ID' })
  @ApiResponse({ status: 200, description: 'Returns the PDF report' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async downloadReport(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, filename } =
      await this.reportsService.generatePdfReport(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${filename}`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Get(':id')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific scan report by ID' })
  @ApiParam({ name: 'id', description: 'The scan ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the scan report',
    type: ScanResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async getReportById(@Param('id') id: string): Promise<ScanResponseDto> {
    return this.reportsService.getReportById(id);
  }

  @Get('stats')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get scan statistics' })
  @ApiResponse({ status: 200, description: 'Returns scan statistics' })
  async getStats() {
    return this.reportsService.getStats();
  }
}
