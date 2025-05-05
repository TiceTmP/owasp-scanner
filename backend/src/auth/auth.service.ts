import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  googleLogin(req: any) {
    if (!req.user) {
      return 'No user from google';
    }
    return {
      message: 'User info from google',
      user: req.user,
    };
  }

  lineLogin(req: any) {
    if (!req.user) {
      return 'No user from LINE';
    }
    return {
      message: 'User info from LINE',
      user: req.user,
    };
  }

  microsoftLogin(req: any) {
    if (!req.user) {
      return 'No user from Microsoft';
    }
    return {
      message: 'User from Microsoft',
      user: req.user,
    };
  }
}
