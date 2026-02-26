import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionReport, ProductionReportRow } from '../entities/production-report.entity';
import { ProductionReportsController } from './production-reports.controller';
import { ProductionReportsService } from './production-reports.service';

@Module({
    imports: [TypeOrmModule.forFeature([ProductionReport, ProductionReportRow])],
    controllers: [ProductionReportsController],
    providers: [ProductionReportsService],
    exports: [ProductionReportsService],
})
export class ProductionReportsModule { }
