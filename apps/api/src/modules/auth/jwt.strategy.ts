import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true, // We need to check if tenant matches
    });
  }

  async validate(req: any, payload: any) {
    const tenantId = payload.tenantId;
    
    // Optional: Validate that the tenant in token matches the tenant in request (resolved by middleware)
    if (req.tenant && req.tenant.id !== tenantId) {
       throw new UnauthorizedException('Tenant mismatch');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
        throw new UnauthorizedException();
    }
    
    return user;
  }
}
