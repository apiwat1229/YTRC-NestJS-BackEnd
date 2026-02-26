import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(JwtStrategy.name);
    constructor(private readonly _configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: _configService.get('JWT_SECRET') || 'your-secret-key',
        });
    }

    async validate(payload: any) {
        this.logger.debug(`Validating payload: ${JSON.stringify(payload)}`);
        return {
            id: payload.sub,
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
            username: payload.username,
            displayName: payload.displayName,
            permissions: payload.permissions || [],
            department: payload.department
        };
    }
}
