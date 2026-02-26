import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GLCode, Machine, MaintenanceStock, RepairLog, StockCategory, StorageLocation } from '../entities/maintenance.entity';
import { GLCodeController } from './gl-code.controller';
import { GLCodeService } from './gl-code.service';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';
import { StockCategoryController } from './stock-category.controller';
import { StockCategoryService } from './stock-category.service';
import { StorageLocationController } from './storage-location.controller';
import { StorageLocationService } from './storage-location.service';

@Module({
    imports: [TypeOrmModule.forFeature([Machine, RepairLog, MaintenanceStock, StockCategory, StorageLocation, GLCode])],
    controllers: [MaintenanceController, GLCodeController, StockCategoryController, StorageLocationController],
    providers: [MaintenanceService, GLCodeService, StockCategoryService, StorageLocationService],
    exports: [MaintenanceService, GLCodeService, StockCategoryService, StorageLocationService],
})
export class MaintenanceModule { }
