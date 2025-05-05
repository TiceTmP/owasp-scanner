import { IsUrl, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ScanRequestDto {
  @ApiProperty({
    description: 'URL ของ Swagger JSON',
    example: 'https://api.example.com/swagger.json',
  })
  @IsUrl()
  @IsNotEmpty()
  apiJsonUrl: string;

  @ApiProperty({
    description: 'Base URL ของ API ที่ต้องการสแกน',
    example: 'https://api.example.com',
  })
  @IsUrl()
  @IsNotEmpty()
  baseUrl: string;

  @ApiProperty({
    description:
      'ระดับความเสี่ยงขั้นต่ำที่ต้องการให้รายงาน (Low, Medium, High, Critical)',
    example: 'Medium',
    required: false,
  })
  @IsString()
  @IsOptional()
  minimumRiskLevel?: string;
}
