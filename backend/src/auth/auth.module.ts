import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from './google.strategy';
import { LineStrategy } from './line.strategy';
import { MicrosoftStrategy } from './microsoft.strategy';

@Module({
  imports: [PassportModule, ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, LineStrategy, MicrosoftStrategy],
})
export class AuthModule {}
