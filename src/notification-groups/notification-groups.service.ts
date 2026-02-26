import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NotificationGroup } from '../entities/notification-group.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class NotificationGroupsService {
    constructor(
        @InjectRepository(NotificationGroup)
        private groupRepo: Repository<NotificationGroup>,
        @InjectRepository(User)
        private userRepo: Repository<User>
    ) { }

    async create(data: { name: string; description?: string; icon?: string; color?: string; memberIds?: string[] }) {
        const { memberIds, ...rest } = data;
        const members = memberIds?.length ? await this.userRepo.findBy({ id: In(memberIds) }) : [];
        const group = this.groupRepo.create({ ...rest, members });
        return this.groupRepo.save(group);
    }

    async findAll() {
        const groups = await this.groupRepo.find({ relations: { members: true }, order: { createdAt: 'DESC' } });
        return groups.map(g => ({ ...g, _count: { members: g.members?.length || 0 } }));
    }

    async findOne(id: string) {
        const group = await this.groupRepo.findOne({ where: { id }, relations: { members: true } });
        if (!group) throw new NotFoundException('Group not found');
        return group;
    }

    async update(id: string, data: { name?: string; description?: string; isActive?: boolean; icon?: string; color?: string; memberIds?: string[] }) {
        const { memberIds, ...rest } = data;
        const group = await this.findOne(id);
        Object.assign(group, rest);
        if (memberIds !== undefined) group.members = await this.userRepo.findBy({ id: In(memberIds) });
        return this.groupRepo.save(group);
    }

    async remove(id: string) { return this.groupRepo.delete(id); }

    async addMembers(groupId: string, userIds: string[]) {
        const group = await this.findOne(groupId);
        const existingIds = group.members.map(m => m.id);
        const newUsers = await this.userRepo.findBy({ id: In(userIds.filter(id => !existingIds.includes(id))) });
        group.members = [...group.members, ...newUsers];
        return this.groupRepo.save(group);
    }

    async removeMember(groupId: string, userId: string) {
        const group = await this.findOne(groupId);
        group.members = group.members.filter(m => m.id !== userId);
        return this.groupRepo.save(group);
    }
}
