import {
    CreatePrinterDepartmentDto,
    SavePrinterUsageRecordDto,
    UpdatePrinterDepartmentDto,
    UpsertPrinterUserMappingDto
} from '../types';
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrinterUsageService } from './printer-usage.service';

@Controller('printer-usage')
@UseGuards(JwtAuthGuard)
export class PrinterUsageController {
    constructor(private readonly printerUsageService: PrinterUsageService) {
        console.log('✅ PrinterUsageController initialized');
    }

    @Get('departments')
    getDepartments() {
        return this.printerUsageService.getDepartments();
    }

    @Post('departments')
    createDepartment(@Body() data: CreatePrinterDepartmentDto) {
        return this.printerUsageService.createDepartment(data);
    }

    @Put('departments/:id')
    updateDepartment(@Param('id') id: string, @Body() data: UpdatePrinterDepartmentDto) {
        return this.printerUsageService.updateDepartment(id, data);
    }

    @Delete('departments/:id')
    deleteDepartment(@Param('id') id: string) {
        return this.printerUsageService.deleteDepartment(id);
    }

    @Get('mappings')
    getMappings() {
        return this.printerUsageService.getMappings();
    }

    @Post('mappings')
    upsertMapping(@Body() data: UpsertPrinterUserMappingDto) {
        return this.printerUsageService.upsertMapping(data);
    }

    @Post('records')
    saveUsageRecords(@Body() records: SavePrinterUsageRecordDto[]) {
        console.log('Received records to save:', JSON.stringify(records, null, 2));
        return this.printerUsageService.saveUsageRecords(records);
    }

    @Get('history')
    getHistory() {
        return this.printerUsageService.getHistory();
    }

    @Delete('history/:period')
    deletePeriod(@Param('period') period: string) {
        return this.printerUsageService.deletePeriod(period);
    }
}
