import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('AZURE_CLIENT_ID'),
      clientSecret: configService.get('AZURE_CLIENT_SECRET'),
      callbackURL: `${configService.get('AZURE_CALL_BACK_URL')}/auth/microsoft/callback`,
      scope: ['user.read', 'openid', 'profile', 'email'],
      tenant: 'common',
      authorizationURL:
        'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    });
  }

  validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    const user = {
      msId: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      accessToken,
    };
    done(null, user);
  }
}
