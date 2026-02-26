import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../types/index';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        // Whitelist special admin user
        if (user?.email === 'apiwat.s@ytrc.co.th') {
            return true;
        }

        return requiredRoles.some((role) => {
            const userRole = user.role?.toLowerCase();
            const requiredRole = role.toLowerCase();
            return userRole === requiredRole;
        });
    }
}
