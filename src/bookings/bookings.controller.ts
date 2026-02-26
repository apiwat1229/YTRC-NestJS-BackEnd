import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { BookingsService } from './bookings.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('bookings')
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) { }

    @Post()
    @Permissions('bookings:create')
    create(@Body() createDto: any) {
        return this.bookingsService.create(createDto);
    }

    @Get()
    @Permissions('bookings:read')
    findAll(@Query('date') date?: string, @Query('slot') slot?: string, @Query('code') code?: string) {
        return this.bookingsService.findAll(date, slot, code);
    }

    @Get('stats/:date')
    @Permissions('bookings:read')
    getStats(@Param('date') date: string) {
        return this.bookingsService.getStats(date);
    }

    @Get(':id/samples')
    @Permissions('bookings:read')
    getSamples(@Param('id') id: string) {
        return this.bookingsService.getSamples(id);
    }

    @Post(':id/samples')
    @Permissions('bookings:create')
    async saveSample(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        console.log(`\n--- [BookingsController] Request to saveSample ---`);
        console.log(`Booking ID: ${id}`);
        console.log(`User: ${req.user?.username || req.user?.id || 'Unknown'}`);
        try {
            return await this.bookingsService.saveSample(id, body);
        } catch (error: any) {
            console.error(`[BookingsController] CRITICAL ERROR:`, error);
            // Force return error as JSON to see it in frontend
            throw new BadRequestException(`CONTROLLER CAUGHT: ${error.message} \nStack: ${error.stack}`);
        }
    }

    @Delete(':id/samples/:sampleId')
    @Permissions('bookings:delete')
    deleteSample(@Param('id') id: string, @Param('sampleId') sampleId: string) {
        return this.bookingsService.deleteSample(id, sampleId);
    }

    @Get(':id')
    @Permissions('bookings:read')
    findOne(@Param('id') id: string) {
        return this.bookingsService.findOne(id);
    }

    @Patch(':id')
    @Permissions('bookings:update')
    update(@Param('id') id: string, @Body() updateDto: any, @Request() req: any) {
        return this.bookingsService.update(id, updateDto, req.user);
    }

    @Patch(':id/check-in')
    @Patch(':id/check-in')
    // @Permissions('bookings:update') <--- Removed strict permission
    async checkIn(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        const user = req.user;
        const hasPermission =
            user.role === 'ADMIN' ||
            (user.permissions && (
                user.permissions.includes('bookings:update') ||
                user.permissions.includes('truckScale:create') ||
                user.permissions.includes('truckScale:update')
            ));

        if (!hasPermission) {
            throw new ForbiddenException('You do not have permission to Check In (requires bookings:update or truckScale:create/update)');
        }

        return this.bookingsService.checkIn(id, body, req.user);
    }

    @Patch(':id/start-drain')
    @Permissions('bookings:update')
    startDrain(@Param('id') id: string, @Request() req: any) {
        return this.bookingsService.startDrain(id, req.user);
    }

    @Patch(':id/stop-drain')
    @Permissions('bookings:update')
    stopDrain(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        return this.bookingsService.stopDrain(id, body, req.user);
    }

    @Patch(':id/weight-in')
    @Permissions('bookings:update')
    saveWeightIn(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        return this.bookingsService.saveWeightIn(id, body, req.user);
    }

    @Patch(':id/weight-out')
    @Permissions('bookings:update')
    saveWeightOut(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        return this.bookingsService.saveWeightOut(id, body, req.user);
    }

    // Samples routes moved up

    @Delete(':id')
    @Permissions('bookings:delete')
    remove(@Param('id') id: string, @Request() req: any) {
        return this.bookingsService.remove(id, req.user);
    }
}
