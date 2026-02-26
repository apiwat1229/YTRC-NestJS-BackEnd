import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { PoolsService } from './pools.service';

@Controller('pools')
export class PoolsController {
    constructor(private readonly poolsService: PoolsService) { }

    @Get()
    async listPools() {
        return this.poolsService.listPools();
    }

    @Post('seed')
    async seedPools() {
        return this.poolsService.seedPools();
    }

    @Get(':id')
    async getPool(@Param('id') id: string) {
        return this.poolsService.getPool(id);
    }

    @Post()
    async createPool(@Body() data: any) {
        return this.poolsService.createPool(data);
    }

    @Put(':id')
    async updatePool(@Param('id') id: string, @Body() data: any) {
        return this.poolsService.updatePool(id, data);
    }

    @Post(':id/items')
    async addItems(@Param('id') id: string, @Body() items: any[]) {
        return this.poolsService.addItems(id, items);
    }

    @Delete(':id/items/:bookingId')
    async removeItem(@Param('id') id: string, @Param('bookingId') bookingId: string) {
        return this.poolsService.removeItem(id, bookingId);
    }

    @Post(':id/close')
    async closePool(@Param('id') id: string, @Body('close_date') closeDate: string) {
        return this.poolsService.closePool(id, closeDate ? new Date(closeDate) : undefined);
    }

    @Post(':id/reopen')
    async reopenPool(@Param('id') id: string) {
        return this.poolsService.reopenPool(id);
    }
}
