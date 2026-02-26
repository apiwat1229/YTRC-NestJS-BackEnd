import { ConflictException, ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthResponse, LoginDto, RegisterDto } from '../types';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private notificationsService: NotificationsService,
        private configService: ConfigService
    ) {
        this.logger.log(`JWT_SECRET present: ${!!this.configService.get('JWT_SECRET')}`);
    }

    async validateUser(identifier: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmailOrUsername(identifier);

        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto): Promise<AuthResponse> {
        const identifier = loginDto.email || loginDto.username;
        if (!identifier) {
            throw new UnauthorizedException('Email or Username is required');
        }
        // Check if user exists
        const user = await this.usersService.findByEmailOrUsername(identifier);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Check if locked
        if (user.status === 'SUSPENDED') {
            throw new UnauthorizedException('Account is locked. Please contact admin.');
        }

        // Check password
        const isMatch = await bcrypt.compare(loginDto.password, user.password);
        if (!isMatch) {
            // Increment failed attempts
            const attempts = (user.failedLoginAttempts || 0) + 1;
            const shouldLock = attempts >= 5;

            await this.usersService.updateLoginAttempts(user.id, attempts, shouldLock);

            if (shouldLock) {
                // Notify IT group
                await this.notifyITGroup(user);
                throw new UnauthorizedException('Account has been locked due to multiple failed login attempts. Please contact IT support.');
            }
            const remaining = 5 - attempts;
            throw new UnauthorizedException(`Password incorrect. ${remaining} attempts remaining.`);
        }

        // Reset attempts on success
        if (user.failedLoginAttempts > 0) {
            await this.usersService.updateLoginAttempts(user.id, 0);
        }


        if (user.forceChangePassword) {
            // Create a temporary token specifically for changing password
            const tempToken = this.jwtService.sign(
                { sub: user.id, email: user.email, scope: 'CHANGE_PASSWORD' },
                { expiresIn: '30m' }
            );

            throw new ForbiddenException({
                code: 'MUST_CHANGE_PASSWORD',
                tempToken,
                message: 'You must change your password to continue.'
            });
        }

        // Update last login
        await this.usersService.updateLastLogin(user.id);

        // Get permissions from role (preferred) or user (fallback)
        const permissions = user.roleRecord?.permissions || user.permissions || [];

        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role,
            username: user.username,
            displayName: user.displayName,
            permissions: permissions,
            department: user.department
        };

        this.logger.debug(`Signing token for user: ${user.id} with payload keys: ${Object.keys(payload)}`);

        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                ...user,
                permissions, // Include merged permissions
                createdAt: (user as any).createdAt?.toISOString(),
                updatedAt: (user as any).updatedAt?.toISOString(),
            } as any,
        };
    }


    async register(registerDto: RegisterDto): Promise<AuthResponse> {
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = await this.usersService.create({
            ...registerDto,
            password: hashedPassword,
        });

        const { password, ...userWithoutPassword } = user as any;
        const payload = {
            email: (user as any).email,
            sub: (user as any).id,
            role: (user as any).role,
            username: (user as any).username,
            displayName: (user as any).displayName,
            permissions: (user as any).permissions || []
        };

        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                ...userWithoutPassword,
                createdAt: (userWithoutPassword as any).createdAt?.toISOString(),
                updatedAt: (userWithoutPassword as any).updatedAt?.toISOString(),
            } as any,
        };
    }

    async signup(signupDto: any) {
        // Check if email already exists
        const existingEmail = await this.usersService.findByEmailOrUsername(signupDto.email);
        if (existingEmail) {
            throw new ConflictException('Email already registered');
        }

        // Check if username already exists
        const existingUsername = await this.usersService.findByEmailOrUsername(signupDto.username);
        if (existingUsername) {
            throw new ConflictException('Username already taken');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(signupDto.password, 10);

        // Create user with PENDING status and no role
        const user = await this.usersService.createPendingUser({
            email: signupDto.email,
            username: signupDto.username,
            firstName: signupDto.firstName,
            lastName: signupDto.lastName,
            password: hashedPassword,
        });

        return {
            message: 'Account created successfully. Please wait for admin approval.',
            userId: user.id,
        };
    }

    async changePassword(userId: string, oldPass: string, newPass: string) {
        // 1. Get user with password by ID directly
        const user = await this.usersService.findByIdWithPassword(userId);

        if (!user || !user.password) {
            console.error(`[ChangePassword] User ${userId} not found or has no password`);
            throw new UnauthorizedException('User not found');
        }

        const isMatch = await bcrypt.compare(oldPass, user.password);
        if (!isMatch) {
            console.error(`[ChangePassword] Password mismatch for user ${userId} (${user.email || user.username})`);
            // Add debug info to exception
            const debugInfo = `OldPassLen: ${oldPass.length}, HashLen: ${user.password.length}`;
            throw new UnauthorizedException(`Old password is incorrect. (${debugInfo})`);
        }

        await this.usersService.update(userId, {
            password: newPass,
            forceChangePassword: false,
        });

        return { message: 'Password changed successfully' };
    }

    /**
     * Notify IT group when account is locked
     */
    private async notifyITGroup(user: any) {
        try {
            // Get IT group members
            const itGroup = await this.notificationsService.getGroupMembers('IT');

            if (!itGroup || itGroup.length === 0) {
                console.warn('[Auth] IT group not found or has no members');
                return;
            }

            // Send notification to each IT member
            for (const member of itGroup) {
                await this.notificationsService.create({
                    userId: member.id,
                    title: 'Account Locked - Security Alert',
                    message: `User account ${user.email} (${user.displayName || 'N/A'}) has been locked due to 5 failed login attempts.`,
                    type: 'WARNING',
                    sourceApp: 'AUTH',
                    actionType: 'ACCOUNT_LOCKED',
                    entityId: user.id,
                    actionUrl: `/admin/users`,
                });
            }

            console.log(`[Auth] Notified ${itGroup.length} IT members about locked account: ${user.email}`);
        } catch (error) {
            console.error('[Auth] Failed to notify IT group:', error);
            // Don't throw - notification failure shouldn't prevent lock
        }
    }
}
