import { ApiProperty } from '@nestjs/swagger';

export class VulnerabilityDto {
  @ApiProperty({ description: 'ระดับความเสี่ยง', example: 'High' })
  risk: string;

  @ApiProperty({ description: 'ระดับความเชื่อมั่น', example: 'Medium' })
  confidence: string;

  @ApiProperty({ description: 'ชื่อช่องโหว่', example: 'SQL Injection' })
  name: string;

  @ApiProperty({ description: 'คำอธิบายช่องโหว่' })
  description: string;

  @ApiProperty({ description: 'วิธีแก้ไขช่องโหว่' })
  solution: string;

  @ApiProperty({ description: 'ข้อมูลอ้างอิง' })
  reference: string;

  @ApiProperty({ description: 'URL ที่พบช่องโหว่' })
  url: string;

  @ApiProperty({ description: 'พารามิเตอร์ที่เกี่ยวข้อง', example: 'id' })
  parameter: string;

  @ApiProperty({ description: 'หลักฐานที่พบ' })
  evidence: string;

  @ApiProperty({ description: 'CWE ID', example: '89' })
  cweid: string;

  @ApiProperty({ description: 'WASC ID', example: '19' })
  wascid: string;
}

export class ScanResponseDto {
  @ApiProperty({
    description: 'รหัสการสแกน',
    example: 'a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890',
  })
  scanId: string;

  @ApiProperty({
    description: 'สถานะการสแกน',
    example: 'PENDING',
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'],
  })
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

  @ApiProperty({
    description: 'ข้อความแสดงสถานะ',
    example: 'Scan is in progress',
  })
  message: string;

  @ApiProperty({
    description: 'URL ของ Swagger JSON',
    example: 'https://api.example.com/swagger.json',
    required: false,
  })
  apiJsonUrl?: string;

  @ApiProperty({
    description: 'Base URL ของ API',
    example: 'https://api.example.com',
    required: false,
  })
  baseUrl?: string;

  @ApiProperty({
    description: 'เวลาที่เริ่มต้นการสแกน',
    example: '2023-05-01T12:00:00.000Z',
    required: false,
  })
  startedAt?: Date | string;

  @ApiProperty({
    description: 'เวลาที่สแกนเสร็จสิ้น',
    example: '2023-05-01T12:34:56.789Z',
    nullable: true,
  })
  completedAt: Date | string | null;

  @ApiProperty({ description: 'รายการช่องโหว่ที่พบ', type: [VulnerabilityDto] })
  vulnerabilities: VulnerabilityDto[];
}
