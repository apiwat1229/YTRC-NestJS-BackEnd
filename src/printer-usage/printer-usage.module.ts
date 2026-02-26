import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrinterDepartment, PrinterUsageRecord, PrinterUserMapping } from '../entities/printer-usage.entity';
import { PrinterUsageController } from './printer-usage.controller';
import { PrinterUsageService } from './printer-usage.service';

@Module({
    imports: [TypeOrmModule.forFeature([PrinterDepartment, PrinterUserMapping, PrinterUsageRecord])],
    controllers: [PrinterUsageController],
    providers: [PrinterUsageService],
    exports: [PrinterUsageService],
})
export class PrinterUsageModule { }
