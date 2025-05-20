import {
  IsUrl,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ScanDepth {
  QUICK = 'quick',
  STANDARD = 'standard',
  DETAILED = 'detailed',
}

export class AuthenticationDto {
  @ApiProperty({
    description: 'URL หน้าล็อกอินของเว็บไซต์',
    example: 'https://example.com/login',
  })
  @IsUrl()
  @IsNotEmpty()
  loginUrl: string;

  @ApiProperty({
    description: 'ชื่อผู้ใช้สำหรับการล็อกอิน',
    example: 'testuser',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'รหัสผ่านสำหรับการล็อกอิน',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'ข้อมูล request สำหรับการล็อกอิน (ตัวเลือก)',
    example: 'username={username}&password={password}&submit=Login',
    required: false,
  })
  @IsString()
  @IsOptional()
  loginRequestData?: string;
}

export class scanOptionsDto {
  @ApiProperty({
    description: 'จำกัดเฉพาะหน้าในโดเมนเดียวกัน',
    default: true,
    required: false,
  })
  @IsOptional()
  sameHostOnly?: boolean;

  @ApiProperty({
    description: 'เวลาในการสแกนสูงสุด (นาที)',
    default: 60,
    required: false,
  })
  @IsOptional()
  maxDuration?: number;
}

export class FrontendScanRequestDto {
  @ApiProperty({
    description: 'URL ของเว็บไซต์ที่ต้องการสแกน',
    example: 'https://example.com',
  })
  @IsUrl()
  @IsNotEmpty()
  frontendUrl: string;

  @ApiProperty({
    description: 'ระดับความลึกของการสแกน',
    enum: ScanDepth,
    default: ScanDepth.STANDARD,
    required: false,
  })
  @IsEnum(ScanDepth)
  @IsOptional()
  scanDepth?: ScanDepth;

  @ApiProperty({
    description:
      'ระดับความเสี่ยงขั้นต่ำที่ต้องการให้รายงาน (Low, Medium, High, Critical)',
    example: 'Medium',
    required: false,
  })
  @IsString()
  @IsOptional()
  minimumRiskLevel?: string;

  @ApiProperty({
    description: 'ข้อมูลสำหรับการล็อกอิน (ถ้าต้องการสแกนหลังจากล็อกอิน)',
    required: false,
    type: AuthenticationDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => AuthenticationDto)
  @IsOptional()
  authentication?: AuthenticationDto;

  @ApiProperty({
    description: 'ตั้งค่าการสแกนเพิ่มเติม',
    required: false,
  })
  @IsObject()
  @IsOptional()
  scanOptions?: scanOptionsDto;
}
