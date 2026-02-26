import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private roleRepo: Repository<Role>,
        @InjectRepository(User)
        private userRepo: Repository<User>
    ) { }

    async findAll() {
        const roles = await this.roleRepo.find({ order: { name: 'ASC' } });
        const withCounts = await Promise.all(
            roles.map(async role => {
                const userCount = await this.userRepo.count({ where: { roleId: role.id } });
                return { ...role, userCount };
            })
        );
        return withCounts;
    }

    async findOne(id: string) {
        const role = await this.roleRepo.findOne({ where: { id } });
        if (!role) throw new NotFoundException(`Role with ID ${id} not found`);
        const users = await this.userRepo.find({
            where: { roleId: id },
            select: { id: true, email: true, firstName: true, lastName: true, displayName: true, avatar: true, department: true, position: true, employeeId: true } as any,
        });
        const userCount = users.length;
        return { ...role, users, userCount };
    }

    async create(data: any) {
        const role = this.roleRepo.create({
            name: data.name,
            description: data.description,
            icon: data.icon,
            color: data.color,
            permissions: data.permissions || [],
            isActive: data.isActive ?? true,
        });
        return this.roleRepo.save(role);
    }

    async update(id: string, data: any) {
        await this.roleRepo.update(id, {
            name: data.name,
            description: data.description,
            icon: data.icon,
            color: data.color,
            permissions: data.permissions,
            isActive: data.isActive,
        });
        return this.findOne(id);
    }

    async remove(id: string) {
        const role = await this.roleRepo.findOne({ where: { id } });
        if (!role) throw new NotFoundException(`Role with ID ${id} not found`);
        const userCount = await this.userRepo.count({ where: { roleId: id } });
        if (userCount > 0) throw new Error(`Cannot delete role with ${userCount} assigned users`);
        return this.roleRepo.delete(id);
    }
}
