import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { MasterService } from './master.service';

@Controller('master')
export class MasterController {
    constructor(private readonly masterService: MasterService) { }

    @Get('provinces')
    getProvinces() {
        return this.masterService.getProvinces();
    }

    @Get('provinces/:id/districts')
    getDistricts(@Param('id', ParseIntPipe) provinceId: number) {
        return this.masterService.getDistricts(provinceId);
    }

    @Get('districts/:id/subdistricts')
    getSubdistricts(@Param('id', ParseIntPipe) districtId: number) {
        return this.masterService.getSubdistricts(districtId);
    }

    @Get('rubber-types')
    getRubberTypes() {
        return this.masterService.getRubberTypes();
    }
}
