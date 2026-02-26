import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../types';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>
    ) { }

    async create(createUserDto: CreateUserDto) {
        const existingUser = await this.userRepo.findOne({ where: { email: createUserDto.email } });
        if (existingUser) throw new ConflictException('User with this email already exists');

        if (createUserDto.username) {
            const existingUsername = await this.userRepo.findOne({ where: { username: createUserDto.username } });
            if (existingUsername) throw new ConflictException('Username is already taken');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = this.userRepo.create({
            ...createUserDto,
            password: hashedPassword,
            forceChangePassword: true,
            roleId: createUserDto.role || undefined,
        } as any);
        return this.userRepo.save(user);
    }

    async createPendingUser(data: { email: string; username: string; firstName: string; lastName: string; password: string }) {
        const user = this.userRepo.create({
            ...data,
            status: 'PENDING',
            forceChangePassword: false,
        });
        return this.userRepo.save(user);
    }

    async findAll() {
        return this.userRepo.find({
            select: {
                id: true, email: true, username: true, firstName: true, lastName: true,
                displayName: true, department: true, position: true, role: true,
                status: true, avatar: true, createdAt: true, updatedAt: true,
                preferences: true,
            } as any,
            relations: { notificationGroups: true } as any,
        });
    }

    async findOne(id: string): Promise<any> {
        const user = await this.userRepo.findOne({
            where: { id },
            relations: { roleRecord: true, notificationGroups: true } as any,
        });
        if (!user) throw new NotFoundException(`User with ID ${id} not found`);
        return user;
    }

    async findByEmail(email: string): Promise<any> {
        return this.userRepo.findOne({
            where: { email },
            relations: { roleRecord: true } as any,
        });
    }

    async findByIdWithPassword(id: string): Promise<any> {
        return this.userRepo.findOne({ where: { id } });
    }

    async findByEmailOrUsername(identifier: string): Promise<any> {
        return this.userRepo.findOne({
            where: [{ email: identifier }, { username: identifier }],
            relations: { roleRecord: true } as any,
        });
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        await this.findOne(id);
        const data: any = { ...updateUserDto };

        if (data.role !== undefined) {
            data.roleId = data.role ? data.role : null;
        }
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        if (data.pinCode) {
            data.pinCode = await bcrypt.hash(data.pinCode, 10);
        }

        await this.userRepo.update(id, data);
        return this.findOne(id);
    }

    async updateLastLogin(id: string) {
        return this.userRepo.update(id, { lastLoginAt: new Date() });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.userRepo.delete(id);
    }

    async updateLoginAttempts(id: string, attempts: number, lock: boolean = false) {
        const data: any = { failedLoginAttempts: attempts };
        if (lock) data.status = 'SUSPENDED';
        return this.userRepo.update(id, data);
    }

    async unlockUser(id: string) {
        await this.findOne(id);
        return this.userRepo.update(id, { status: 'ACTIVE', failedLoginAttempts: 0 });
    }

    async updateAvatar(id: string, avatarUrl: string) {
        await this.findOne(id);
        return this.userRepo.update(id, { avatar: avatarUrl });
    }
}
