import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
    this.logger.log('JWT Strategy initialized with secret:', configService.get<string>('JWT_SECRET') ? 'Secret present' : 'No secret found');
  }

  async validate(payload: any) {
    this.logger.log('JWT Strategy - Validating payload:', JSON.stringify(payload));
    const result = { id: payload.sub, email: payload.email };
    this.logger.log('JWT Strategy - Validation result:', JSON.stringify(result));
    return result;
  }
}
