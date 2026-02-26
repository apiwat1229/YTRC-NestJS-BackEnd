import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NotificationGroup } from '../entities/notification-group.entity';
import { Notification } from '../entities/notification.entity';
import { User } from '../entities/user.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private notifRepo: Repository<Notification>,
        @InjectRepository(NotificationGroup)
        private groupRepo: Repository<NotificationGroup>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private notificationsGateway: NotificationsGateway
    ) { }

    private mapToDto(notification: any) {
        return { ...notification, isRead: notification.status === 'READ' };
    }

    async create(data: {
        userId: string;
        title: string;
        message: string;
        type?: string;
        sourceApp: string;
        actionType: string;
        entityId?: string;
        actionUrl?: string;
        metadata?: any;
    }) {
        const notification = this.notifRepo.create({
            ...data,
            type: data.type || 'INFO',
            metadata: data.metadata || {},
        });
        const saved = await this.notifRepo.save(notification);
        const dto = this.mapToDto(saved);
        this.notificationsGateway.sendNotificationToUser(data.userId, dto);
        return dto;
    }

    async broadcast(data: {
        title: string;
        message: string;
        type?: string;
        recipientRoles?: string[];
        recipientUsers?: string[];
        recipientGroups?: string[];
        senderId?: string;
        actionUrl?: string;
    }) {
        const hasTargets =
            (data.recipientUsers?.length || 0) > 0 ||
            (data.recipientRoles?.length || 0) > 0 ||
            (data.recipientGroups?.length || 0) > 0;

        if (!hasTargets) return { count: 0, message: 'No recipients specified.' };

        const userIdSet = new Set<string>();

        if (data.recipientUsers?.length) {
            data.recipientUsers.forEach(id => userIdSet.add(id));
        }

        if (data.recipientRoles?.length) {
            const users = await this.userRepo.find({
                where: data.recipientRoles.map(role => [{ role }, { roleId: role }]).flat() as any,
                select: { id: true } as any,
            });
            users.forEach(u => userIdSet.add(u.id));
        }

        if (data.recipientGroups?.length) {
            const groups = await this.groupRepo.find({
                where: { id: In(data.recipientGroups) },
                relations: { members: true },
            });
            groups.flatMap(g => g.members).forEach(m => userIdSet.add(m.id));
        }

        const uniqueUserIds = [...userIdSet];
        if (uniqueUserIds.length === 0) return { count: 0, message: 'No matching users found.' };

        let createdCount = 0;
        for (const userId of uniqueUserIds) {
            const notif = this.notifRepo.create({
                title: data.title,
                message: data.message,
                type: data.type || 'INFO',
                userId,
                sourceApp: 'ADMIN_BROADCAST',
                actionType: 'MANUAL_BROADCAST',
                actionUrl: data.actionUrl,
                metadata: { senderId: data.senderId },
            });
            const saved = await this.notifRepo.save(notif);
            this.notificationsGateway.sendNotificationToUser(userId, saved);
            createdCount++;
        }

        return { count: createdCount, message: `Broadcasted to ${createdCount} users.` };
    }

    async findAll(userId: string) {
        const results = await this.notifRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
        return results.map(n => this.mapToDto(n));
    }

    async findUnread(userId: string) {
        const results = await this.notifRepo.find({
            where: { userId, status: 'UNREAD' },
            order: { createdAt: 'DESC' },
        });
        return results.map(n => this.mapToDto(n));
    }

    async markAsRead(id: string, userId: string) {
        await this.notifRepo.update({ id, userId }, { status: 'READ' });
        const result = await this.notifRepo.findOne({ where: { id, userId } });
        return this.mapToDto(result);
    }

    async delete(id: string, userId: string) {
        return this.notifRepo.delete({ id, userId });
    }

    async markAllAsRead(userId: string) {
        return this.notifRepo.update({ userId, status: 'UNREAD' }, { status: 'READ' });
    }

    async getBroadcastHistory() {
        const broadcasts = await this.notifRepo.find({
            where: { sourceApp: 'ADMIN_BROADCAST', actionType: 'MANUAL_BROADCAST' },
            order: { createdAt: 'DESC' },
            take: 100,
        });

        const grouped = broadcasts.reduce((acc: any, notif: any) => {
            const key = `${notif.title}-${notif.message}-${notif.type}-${new Date(notif.createdAt).toISOString().slice(0, 16)}`;
            if (!acc[key]) {
                acc[key] = { id: notif.id, title: notif.title, message: notif.message, type: notif.type, createdAt: notif.createdAt, recipientCount: 1, recipientDetails: [] };
            } else {
                acc[key].recipientCount += 1;
            }
            return acc;
        }, {});

        return Object.values(grouped);
    }

    async deleteBroadcast(id: string) {
        const target = await this.notifRepo.findOne({ where: { id } });
        if (!target) throw new Error('Notification not found');
        const timeWindow = 5000;
        const createdTime = new Date(target.createdAt).getTime();
        const result = await this.notifRepo.createQueryBuilder()
            .delete()
            .where('title = :title AND message = :message AND source_app = :sourceApp AND action_type = :actionType AND created_at >= :minTime AND created_at <= :maxTime', {
                title: target.title, message: target.message, sourceApp: target.sourceApp,
                actionType: target.actionType,
                minTime: new Date(createdTime - timeWindow),
                maxTime: new Date(createdTime + timeWindow),
            })
            .execute();
        return { count: result.affected, message: `Deleted ${result.affected} notifications from history.` };
    }

    async deleteBroadcasts(ids: string[]) {
        let totalCount = 0;
        for (const id of ids) {
            try {
                const result = await this.deleteBroadcast(id);
                totalCount += result.count || 0;
            } catch (error) {
                console.warn(`Failed to delete broadcast ${id}:`, error);
            }
        }
        return { count: totalCount, message: `Deleted ${totalCount} notifications from history.` };
    }

    async getSettings() {
        // NotificationSetting table — return empty if not configured
        return [];
    }

    async updateSetting(sourceApp: string, actionType: string, data: any) {
        return { sourceApp, actionType, ...data };
    }

    async findAllGroups() {
        return this.groupRepo.find({ relations: { members: true }, order: { name: 'ASC' } });
    }

    async createGroup(data: { name: string; description?: string; memberIds?: string[] }) {
        const members = data.memberIds ? await this.userRepo.findBy({ id: In(data.memberIds) }) : [];
        const group = this.groupRepo.create({ name: data.name, description: data.description, members });
        return this.groupRepo.save(group);
    }

    async updateGroup(id: string, data: { name?: string; description?: string; memberIds?: string[] }) {
        const group = await this.groupRepo.findOne({ where: { id }, relations: { members: true } });
        if (!group) throw new Error(`Group ${id} not found`);
        if (data.name) group.name = data.name;
        if (data.description !== undefined) group.description = data.description;
        if (data.memberIds !== undefined) {
            group.members = await this.userRepo.findBy({ id: In(data.memberIds) });
        }
        return this.groupRepo.save(group);
    }

    async deleteGroup(id: string) {
        return this.groupRepo.delete(id);
    }

    async getGroupMembers(groupName: string) {
        const group = await this.groupRepo.findOne({
            where: { name: groupName },
            relations: { members: true },
        });
        return group?.members || [];
    }
}
