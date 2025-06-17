import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from './google.strategy';
import { LineStrategy } from './line.strategy';
import { MicrosoftStrategy } from './microsoft.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [
    // PassportModule,
    // ConfigModule,
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // GoogleStrategy,
    // LineStrategy,
    // MicrosoftStrategy
  ],
})
export class AuthModule {}
