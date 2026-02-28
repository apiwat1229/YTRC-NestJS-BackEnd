import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UuidSubscriber } from './uuid.subscriber';
import {
    ApprovalLog,
    ApprovalRequest,
    BookView,
    Booking,
    BookingLabSample,
    CpkAnalysis,
    District,
    GLCode,
    ITAsset,
    ITTicket,
    JobOrder,
    JobOrderLog,
    KnowledgeBook,
    Machine,
    MaintenanceStock,
    Notification,
    NotificationGroup,
    Pool,
    PoolItem,
    Post,
    PrinterDepartment,
    PrinterUsageRecord,
    PrinterUserMapping,
    ProductionReport,
    ProductionReportRow,
    Province,
    RawMaterialPlan,
    RawMaterialPlanPoolDetail,
    RawMaterialPlanRow,
    RepairLog,
    Role,
    RubberType,
    StockCategory,
    StorageLocation,
    Subdistrict,
    Supplier,
    TicketComment,
    User,
} from '../entities';

@Global()
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                url: configService.get<string>('DATABASE_URL'),
                entities: [
                    User,
                    Role,
                    Notification,
                    NotificationGroup,
                    ApprovalRequest,
                    ApprovalLog,
                    Booking,
                    BookingLabSample,
                    Supplier,
                    RubberType,
                    Pool,
                    PoolItem,
                    ITAsset,
                    ITTicket,
                    TicketComment,
                    KnowledgeBook,
                    BookView,
                    JobOrder,
                    JobOrderLog,
                    Machine,
                    RepairLog,
                    MaintenanceStock,
                    GLCode,
                    StockCategory,
                    StorageLocation,
                    Post,
                    PrinterDepartment,
                    PrinterUserMapping,
                    PrinterUsageRecord,
                    RawMaterialPlan,
                    RawMaterialPlanRow,
                    RawMaterialPlanPoolDetail,
                    ProductionReport,
                    ProductionReportRow,
                    CpkAnalysis,
                    Province,
                    District,
                    Subdistrict,
                ],
                subscribers: [UuidSubscriber],
                synchronize: configService.get('DB_SYNC') !== 'false',
                logging: ['error', 'warn'],
                ssl: (() => {
                    const dbSsl = configService.get<string>('DB_SSL');
                    if (dbSsl === 'false') return false;
                    if (dbSsl === 'true') return { rejectUnauthorized: false };
                    // Default: enable SSL only in production
                    return configService.get('NODE_ENV') === 'production'
                        ? { rejectUnauthorized: false }
                        : false;
                })(),
            }),
        }),
    ],
    exports: [TypeOrmModule],
})
export class DatabaseModule { }
