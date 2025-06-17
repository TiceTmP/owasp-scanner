import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: any) {
    return this.authService.googleLogin(req);
  }

  @Get('line')
  @UseGuards(AuthGuard('line'))
  async lineAuth() {}

  @Get('line/callback')
  @UseGuards(AuthGuard('line'))
  lineAuthRedirect(@Req() req: any) {
    return this.authService.lineLogin(req);
  }

  @Get('microsoft')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftAuth() {}

  @Get('microsoft/callback')
  @UseGuards(AuthGuard('microsoft'))
  microsoftAuthRedirect(@Req() req: any) {
    return this.authService.microsoftLogin(req);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return await this.authService.login(body);
  }

  @Get('create-admin-user')
  async createAdminUser() {
    return await this.authService.createAdminUser();
  }
}
