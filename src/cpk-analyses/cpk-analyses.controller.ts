import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CpkAnalysesService } from './cpk-analyses.service';
import { CreateCpkAnalysisDto } from './dto/create-cpk-analysis.dto';

@ApiTags('cpk-analyses')
@Controller('cpk-analyses')
export class CpkAnalysesController {
    constructor(private readonly cpkAnalysesService: CpkAnalysesService) { }

    @Post()
    create(@Body() createCpkAnalysisDto: CreateCpkAnalysisDto) {
        return this.cpkAnalysesService.create(createCpkAnalysisDto);
    }

    @Get()
    findAll() {
        return this.cpkAnalysesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.cpkAnalysesService.findOne(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.cpkAnalysesService.remove(id);
    }
}
