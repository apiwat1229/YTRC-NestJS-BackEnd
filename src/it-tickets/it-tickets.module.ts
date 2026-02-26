import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ITAsset } from '../entities/it-asset.entity';
import { ITTicket, TicketComment } from '../entities/it-ticket.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { ITTicketsController } from './it-tickets.controller';
import { ITTicketsService } from './it-tickets.service';

@Module({
    imports: [TypeOrmModule.forFeature([ITTicket, TicketComment, ITAsset]), AuthModule, NotificationsModule],
    controllers: [ITTicketsController],
    providers: [ITTicketsService],
})
export class ITTicketsModule { }
