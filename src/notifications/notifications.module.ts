import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationGroup } from '../entities/notification-group.entity';
import { Notification } from '../entities/notification.entity';
import { User } from '../entities/user.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';

@Module({
    imports: [TypeOrmModule.forFeature([Notification, NotificationGroup, User])],
    controllers: [NotificationsController],
    providers: [NotificationsService, NotificationsGateway],
    exports: [NotificationsService],
})
export class NotificationsModule { }
