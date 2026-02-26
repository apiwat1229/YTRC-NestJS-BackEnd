import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationGroup } from '../entities/notification-group.entity';
import { User } from '../entities/user.entity';
import { NotificationGroupsController } from './notification-groups.controller';
import { NotificationGroupsService } from './notification-groups.service';

@Module({
    imports: [TypeOrmModule.forFeature([NotificationGroup, User])],
    controllers: [NotificationGroupsController],
    providers: [NotificationGroupsService],
    exports: [NotificationGroupsService],
})
export class NotificationGroupsModule { }
