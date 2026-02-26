import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateProductionReportDto } from './dto/create-production-report.dto';
import { ProductionReportsService } from './production-reports.service';

@Controller('production-reports')
export class ProductionReportsController {
    constructor(private readonly productionReportsService: ProductionReportsService) { }

    @Post()
    create(@Body() createDto: CreateProductionReportDto) {
        return this.productionReportsService.create(createDto);
    }

    @Get()
    findAll() {
        return this.productionReportsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productionReportsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: CreateProductionReportDto) {
        return this.productionReportsService.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.productionReportsService.remove(id);
    }
}
