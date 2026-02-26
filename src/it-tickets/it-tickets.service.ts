import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITAsset } from '../entities/it-asset.entity';
import { ITTicket, TicketComment } from '../entities/it-ticket.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateITTicketDto, CreateTicketCommentDto, UpdateITTicketDto } from './dto/it-ticket.dto';

@Injectable()
export class ITTicketsService {
    constructor(
        @InjectRepository(ITTicket)
        private ticketRepo: Repository<ITTicket>,
        @InjectRepository(TicketComment)
        private commentRepo: Repository<TicketComment>,
        @InjectRepository(ITAsset)
        private assetRepo: Repository<ITAsset>,
        private notificationsService: NotificationsService
    ) { }

    async create(userId: string, createDto: CreateITTicketDto) {
        const lastTicket = await this.ticketRepo.findOne({ order: { createdAt: 'DESC' } });
        let nextNo = 1000;
        if (lastTicket && lastTicket.ticketNo.startsWith('T-')) {
            const lastNo = parseInt(lastTicket.ticketNo.replace('T-', ''));
            if (!isNaN(lastNo)) nextNo = lastNo + 1;
        }
        const ticketNo = `T-${nextNo}`;
        const ticket = this.ticketRepo.create({ ...createDto as any, ticketNo, requesterId: userId });
        const saved = await this.ticketRepo.save(ticket) as unknown as ITTicket;
        return this.findOne(saved.id);
    }

    private async triggerNotification(sourceApp: string, actionType: string, payload: { title: string; message: string; actionUrl?: string }, explicitUserIds: string[] = [], type: string = 'INFO') {
        try {
            for (const userId of [...new Set(explicitUserIds)]) {
                await this.notificationsService.create({ userId, title: payload.title, message: payload.message, type, sourceApp, actionType, actionUrl: payload.actionUrl });
            }
        } catch (error) { console.error('Error triggering notification:', error); }
    }

    async findAll(userId?: string, isAdmin = false) {
        const where = !isAdmin && userId ? { requesterId: userId } : {};
        return this.ticketRepo.find({ where, order: { createdAt: 'DESC' } });
    }

    async findOne(id: string) {
        return this.ticketRepo.findOne({ where: { id }, relations: { comments: true } });
    }

    async update(id: string, updateDto: UpdateITTicketDto) {
        const currentTicket = await this.ticketRepo.findOne({ where: { id } });
        await this.ticketRepo.update(id, updateDto as any);
        const ticket = await this.findOne(id);

        if (updateDto.status === 'Approved' && currentTicket?.status !== 'Approved' && (ticket as any)?.isAssetRequest && (ticket as any)?.assetId && (ticket as any)?.quantity > 0) {
            try {
                await this.assetRepo.decrement({ id: (ticket as any).assetId }, 'stock', (ticket as any).quantity);
            } catch (error) { console.error(`Failed to deduct stock:`, error); }
        }

        if (updateDto.status) {
            await this.triggerNotification('IT_HELP_DESK', 'TICKET_UPDATED', { title: `Ticket Updated: ${(ticket as any)?.ticketNo}`, message: `Status changed to ${(ticket as any)?.status}`, actionUrl: `/admin/helpdesk?ticketId=${id}` }, [(ticket as any)?.requesterId]);
        }
        if (updateDto.assigneeId) {
            await this.triggerNotification('IT_HELP_DESK', 'TICKET_ASSIGNED', { title: `Ticket Assigned`, message: `You have been assigned to ticket ${(ticket as any)?.ticketNo}`, actionUrl: `/admin/helpdesk?ticketId=${id}` }, [updateDto.assigneeId]);
        }
        return ticket;
    }

    async remove(id: string) {
        return this.ticketRepo.delete(id);
    }

    async addComment(ticketId: string, userId: string, createDto: CreateTicketCommentDto) {
        const comment = this.commentRepo.create({ content: createDto.content, ticketId, authorId: userId });
        const saved = await this.commentRepo.save(comment);
        const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
        if (ticket) {
            const targets: string[] = [];
            if (userId !== ticket.requesterId) targets.push(ticket.requesterId);
            if (ticket.assigneeId && userId !== ticket.assigneeId) targets.push(ticket.assigneeId);
            if (targets.length > 0) {
                await this.triggerNotification('IT_HELP_DESK', 'NEW_COMMENT', { title: `New Comment on ${ticket.ticketNo}`, message: `New comment added`, actionUrl: `/admin/helpdesk?ticketId=${ticketId}` }, targets);
            }
        }
        return saved;
    }
}
