import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { Db54Data, PlcService } from './plc.service';

@Controller('plc')
export class PlcController {
    constructor(private readonly plcService: PlcService) { }

    @Get('status')
    getStatus() {
        return this.plcService.getStatus();
    }

    @Get('db54')
    async getDb54() {
        return await this.plcService.readDb54();
    }

    @Post('db54')
    async updateDb54(@Body() body: Db54Data) {
        return await this.plcService.writeDb54(body);
    }

    @Get('line-use')
    async getLineUse() {
        return await this.plcService.readLineUse();
    }

    @Post('line-use/:index')
    async updateLineUse(
        @Param('index', ParseIntPipe) index: number,
        @Body('value') value: boolean,
    ) {
        return await this.plcService.writeLineUse(index, value);
    }
}
