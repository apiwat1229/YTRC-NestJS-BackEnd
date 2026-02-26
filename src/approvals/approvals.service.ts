import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThanOrEqual, Repository } from 'typeorm';
import { ApprovalLog, ApprovalRequest } from '../entities/approval.entity';
import { User } from '../entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { ApproveDto, CancelDto, CreateApprovalRequestDto, RejectDto, ReturnDto, VoidDto } from './dto/approval.dto';

@Injectable()
export class ApprovalsService {
    constructor(
        @InjectRepository(ApprovalRequest)
        private approvalRepo: Repository<ApprovalRequest>,
        @InjectRepository(ApprovalLog)
        private logRepo: Repository<ApprovalLog>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private notificationsService: NotificationsService
    ) { }

    async createRequest(requesterId: string, dto: CreateApprovalRequestDto) {
        const request = this.approvalRepo.create({
            requestType: dto.requestType,
            entityType: dto.entityType,
            entityId: dto.entityId,
            sourceApp: dto.sourceApp,
            actionType: dto.actionType,
            currentData: dto.currentData || {},
            proposedData: dto.proposedData || {},
            reason: dto.reason,
            priority: dto.priority || 'NORMAL',
            expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
            requesterId,
            status: 'PENDING',
        });
        const saved = await this.approvalRepo.save(request);
        const savedWithRelations = await this.findOne(saved.id);

        await this.createAuditLog({
            approvalRequestId: saved.id, action: 'CREATED', actorId: requesterId,
            actorName: savedWithRelations.requester?.displayName || savedWithRelations.requester?.email || requesterId,
            actorRole: savedWithRelations.requester?.role || 'user',
            newValue: { status: 'PENDING' }, remark: dto.reason,
        });

        await this.notifyApprovers(savedWithRelations);
        return savedWithRelations;
    }

    async findAll(filters?: { status?: string; entityType?: string; includeDeleted?: boolean }) {
        const qb = this.approvalRepo.createQueryBuilder('ar')
            .leftJoinAndSelect('ar.requester', 'requester')
            .leftJoinAndSelect('ar.approver', 'approver');
        if (filters?.status) qb.andWhere('ar.status = :status', { status: filters.status });
        if (filters?.entityType) qb.andWhere('ar.entityType = :entityType', { entityType: filters.entityType });
        if (!filters?.includeDeleted) qb.andWhere('ar.deletedAt IS NULL');
        return qb.orderBy('ar.submittedAt', 'DESC').getMany();
    }

    async findOne(id: string) {
        const request = await this.approvalRepo.findOne({
            where: { id },
            relations: { requester: true, approver: true, logs: true },
        });
        if (!request) throw new NotFoundException('Approval request not found');
        return request;
    }

    async findMyRequests(userId: string) {
        return this.approvalRepo.find({
            where: { requesterId: userId, deletedAt: IsNull() },
            relations: { approver: true },
            order: { submittedAt: 'DESC' },
        });
    }

    async approve(id: string, approverId: string, dto: ApproveDto) {
        const request = await this.findOne(id);
        if (request.status !== 'PENDING') throw new BadRequestException('Only pending requests can be approved');
        const approver = await this.userRepo.findOne({ where: { id: approverId }, select: { displayName: true, email: true, role: true } as any });
        await this.approvalRepo.update(id, { status: 'APPROVED', approverId, actedAt: new Date(), remark: dto.remark });
        await this.createAuditLog({ approvalRequestId: id, action: 'APPROVED', actorId: approverId, actorName: approver?.displayName || approver?.email || approverId, actorRole: approver?.role || 'user', oldValue: { status: 'PENDING' }, newValue: { status: 'APPROVED' }, remark: dto.remark });
        await this.notificationsService.create({ userId: request.requesterId, title: 'คำขออนุมัติได้รับการอนุมัติ', message: `คำขอ ${request.requestType} ของคุณได้รับการอนุมัติแล้ว`, type: 'INFO', sourceApp: 'APPROVALS', actionType: 'APPROVED', entityId: request.id, actionUrl: `/approvals/${request.id}` });
        await this.applyApprovedChanges(request);
        return this.findOne(id);
    }

    private async applyApprovedChanges(request: any) {
        try {
            // Changes are applied by the owning service when needed
            console.log(`[ApprovalsService] Apply changes for ${request.entityType}:${request.actionType} - entity ${request.entityId}`);
        } catch (error) {
            console.error('[ApprovalsService] Failed to apply approved changes:', error);
        }
    }

    async reject(id: string, approverId: string, dto: RejectDto) {
        const request = await this.findOne(id);
        if (request.status !== 'PENDING') throw new BadRequestException('Only pending requests can be rejected');
        const approver = await this.userRepo.findOne({ where: { id: approverId }, select: { displayName: true, email: true, role: true } as any });
        await this.approvalRepo.update(id, { status: 'REJECTED', approverId, actedAt: new Date(), remark: dto.remark });
        await this.createAuditLog({ approvalRequestId: id, action: 'REJECTED', actorId: approverId, actorName: approver?.displayName || approver?.email || approverId, actorRole: approver?.role || 'user', oldValue: { status: 'PENDING' }, newValue: { status: 'REJECTED' }, remark: dto.remark });
        await this.notificationsService.create({ userId: request.requesterId, title: 'คำขออนุมัติถูกปฏิเสธ', message: `คำขอ ${request.requestType} ถูกปฏิเสธ: ${dto.remark}`, type: 'INFO', sourceApp: 'APPROVALS', actionType: 'REJECTED', entityId: request.id, actionUrl: `/approvals/${request.id}` });
        return this.findOne(id);
    }

    async return(id: string, approverId: string, dto: ReturnDto) {
        const request = await this.findOne(id);
        if (request.status !== 'PENDING') throw new BadRequestException('Only pending requests can be returned');
        const approver = await this.userRepo.findOne({ where: { id: approverId }, select: { displayName: true, email: true, role: true } as any });
        await this.approvalRepo.update(id, { status: 'RETURNED', approverId, actedAt: new Date(), remark: dto.remark });
        await this.createAuditLog({ approvalRequestId: id, action: 'RETURNED', actorId: approverId, actorName: approver?.displayName || approver?.email || approverId, actorRole: approver?.role || 'user', oldValue: { status: 'PENDING' }, newValue: { status: 'RETURNED' }, remark: dto.remark });
        await this.notificationsService.create({ userId: request.requesterId, title: 'คำขอถูกส่งคืนเพื่อแก้ไข', message: `คำขอ ${request.requestType} ถูกส่งคืน: ${dto.remark}`, type: 'INFO', sourceApp: 'APPROVALS', actionType: 'RETURNED', entityId: request.id, actionUrl: `/approvals/${request.id}` });
        return this.findOne(id);
    }

    async cancel(id: string, userId: string, dto: CancelDto) {
        const request = await this.findOne(id);
        if (request.requesterId !== userId) throw new ForbiddenException('Only the requester can cancel this request');
        if (request.status !== 'PENDING') throw new BadRequestException('Only pending requests can be cancelled');
        const user = await this.userRepo.findOne({ where: { id: userId }, select: { displayName: true, email: true, role: true } as any });
        await this.approvalRepo.update(id, { status: 'CANCELLED', actedAt: new Date(), remark: dto.reason });
        await this.createAuditLog({ approvalRequestId: id, action: 'CANCELLED', actorId: userId, actorName: user?.displayName || user?.email || userId, actorRole: user?.role || 'user', oldValue: { status: 'PENDING' }, newValue: { status: 'CANCELLED' }, remark: dto.reason });
        return this.findOne(id);
    }

    async void(id: string, adminId: string, dto: VoidDto) {
        const request = await this.findOne(id);
        if (request.status !== 'APPROVED') throw new BadRequestException('Only approved requests can be voided');
        const admin = await this.userRepo.findOne({ where: { id: adminId }, select: { displayName: true, email: true, role: true } as any });
        await this.approvalRepo.update(id, { status: 'VOID', actedAt: new Date(), remark: dto.reason });
        await this.createAuditLog({ approvalRequestId: id, action: 'VOIDED', actorId: adminId, actorName: admin?.displayName || admin?.email || adminId, actorRole: admin?.role || 'admin', oldValue: { status: 'APPROVED' }, newValue: { status: 'VOID' }, remark: dto.reason });
        await this.notificationsService.create({ userId: request.requesterId, title: 'คำขอถูกทำเป็นโมฆะ', message: `คำขอ ${request.requestType} ถูกทำเป็นโมฆะ: ${dto.reason}`, type: 'INFO', sourceApp: 'APPROVALS', actionType: 'VOIDED', entityId: request.id, actionUrl: `/approvals/${request.id}` });
        return this.findOne(id);
    }

    async softDelete(id: string, userId: string) {
        const request = await this.findOne(id);
        const user = await this.userRepo.findOne({ where: { id: userId }, select: { displayName: true, email: true, role: true } as any });
        await this.approvalRepo.update(id, { deletedAt: new Date(), deletedBy: userId });
        await this.createAuditLog({ approvalRequestId: id, action: 'DELETED', actorId: userId, actorName: user?.displayName || user?.email || userId, actorRole: user?.role || 'user', oldValue: { deletedAt: null }, newValue: { deletedAt: new Date() } });
        return this.findOne(id);
    }

    async getHistory(id: string) {
        await this.findOne(id);
        return this.logRepo.find({ where: { approvalRequestId: id }, order: { createdAt: 'ASC' } });
    }

    private async createAuditLog(data: { approvalRequestId: string; action: string; actorId: string; actorName: string; actorRole: string; oldValue?: any; newValue?: any; remark?: string; ipAddress?: string; userAgent?: string }) {
        const log = this.logRepo.create({ ...data, oldValue: data.oldValue || {}, newValue: data.newValue || {} });
        return this.logRepo.save(log);
    }

    private async notifyApprovers(request: any) {
        const admins = await this.userRepo.find({ where: [{ role: 'ADMIN' }, { role: 'admin' }] as any, select: { id: true } as any });
        for (const admin of admins) {
            await this.notificationsService.create({ userId: admin.id, title: 'คำขออนุมัติใหม่', message: `ส่งคำขอ ${request.requestType}`, type: 'INFO', sourceApp: 'APPROVALS', actionType: 'APPROVAL_REQUEST', entityId: request.id, actionUrl: `/approvals/${request.id}` });
        }
    }

    @Cron(CronExpression.EVERY_HOUR)
    async handleExpiredRequests() {
        const now = new Date();
        const expiredRequests = await this.approvalRepo.find({
            where: { status: 'PENDING', expiresAt: LessThanOrEqual(now), deletedAt: IsNull() },
            relations: { requester: true },
        });
        for (const request of expiredRequests) {
            await this.approvalRepo.update(request.id, { status: 'EXPIRED', actedAt: now });
            await this.createAuditLog({ approvalRequestId: request.id, action: 'EXPIRED', actorId: 'SYSTEM', actorName: 'System', actorRole: 'SYSTEM', oldValue: { status: 'PENDING' }, newValue: { status: 'EXPIRED' }, remark: 'Request expired automatically' });
            await this.notificationsService.create({ userId: request.requesterId, title: 'คำขอหมดอายุ', message: `คำขอ ${request.requestType} หมดอายุ`, type: 'INFO', sourceApp: 'APPROVALS', actionType: 'EXPIRED', entityId: request.id, actionUrl: `/approvals/${request.id}` });
        }
        if (expiredRequests.length > 0) console.log(`[ApprovalsService] Expired ${expiredRequests.length} requests`);
    }
}
