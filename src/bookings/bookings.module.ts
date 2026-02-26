import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalsModule } from '../approvals/approvals.module';
import { Booking, BookingLabSample } from '../entities/booking.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Booking, BookingLabSample]),
        NotificationsModule,
        ApprovalsModule,
    ],
    controllers: [BookingsController],
    providers: [BookingsService],
})
export class BookingsModule { }
