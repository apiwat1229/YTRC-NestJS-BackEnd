import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalLog, ApprovalRequest } from '../entities/approval.entity';
import { User } from '../entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { ApprovalsController } from './approvals.controller';
import { ApprovalsService } from './approvals.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([ApprovalRequest, ApprovalLog, User]),
        NotificationsModule,
        ScheduleModule.forRoot(),
    ],
    controllers: [ApprovalsController],
    providers: [ApprovalsService],
    exports: [ApprovalsService],
})
export class ApprovalsModule { }
