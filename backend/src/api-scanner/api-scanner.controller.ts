import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiScannerService } from './api-scanner.service';
import { ScanRequestDto } from './dto/scan-request.dto';
import { ScanResponseDto } from './dto/scan-response.dto';
import { FrontendScanRequestDto } from './dto/frontend-scan-request.dto';

@ApiTags('api-scanner')
@Controller('api-scanner')
export class ApiScannerController {
  constructor(private readonly apiScannerService: ApiScannerService) {}

  @Post()
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Scan API endpoints using OWASP ZAP' })
  @ApiResponse({
    status: 201,
    description: 'The scan has been created',
    type: ScanResponseDto,
  })
  async scanApi(
    @Body() scanRequestDto: ScanRequestDto,
  ): Promise<ScanResponseDto> {
    return this.apiScannerService.scanApi(scanRequestDto);
  }

  @Post('frontend')
  @ApiOperation({ summary: 'สแกนเว็บไซต์ frontend ตามมาตรฐาน OWASP' })
  @ApiResponse({
    status: 201,
    description: 'การสแกนได้ถูกสร้างขึ้น',
    type: ScanResponseDto,
  })
  async scanFrontend(
    @Body() frontendScanRequestDto: FrontendScanRequestDto,
  ): Promise<ScanResponseDto> {
    return this.apiScannerService.scanFrontend(frontendScanRequestDto);
  }

  @Get(':id')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get scan results by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the scan results',
    type: ScanResponseDto,
  })
  async getScanResults(@Param('id') id: string): Promise<ScanResponseDto> {
    return this.apiScannerService.getScanResultsById(id);
  }
}
