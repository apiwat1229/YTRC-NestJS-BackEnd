import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateRepairDto } from './dto/update-repair.dto';
import { MaintenanceService } from './maintenance.service';

@Controller('maintenance')
export class MaintenanceController {
    constructor(private readonly myMachineService: MaintenanceService) { }

    // Machines
    @Get('machines')
    findAllMachines() {
        return this.myMachineService.findAllMachines();
    }

    @Get('machines/:id')
    findMachineById(@Param('id') id: string) {
        return this.myMachineService.findMachineById(id);
    }

    @Post('machines')
    createMachine(@Body() data: any) {
        return this.myMachineService.createMachine(data);
    }

    @Delete('machines/:id')
    deleteMachine(@Param('id') id: string) {
        return this.myMachineService.deleteMachine(id);
    }

    @Post('machines/:id/update')
    updateMachine(@Param('id') id: string, @Body() data: any) {
        return this.myMachineService.updateMachine(id, data);
    }

    // Repair Logs
    @Get('repairs')
    findAllRepairs() {
        return this.myMachineService.findAllRepairs();
    }

    // Public Endpoint for scannable QR codes
    @Public()
    @Get('public/repairs/:id')
    findPublicRepair(@Param('id') id: string) {
        return this.myMachineService.findRepairById(id);
    }

    @Get('repairs/:id')
    findRepairById(@Param('id') id: string) {
        return this.myMachineService.findRepairById(id);
    }

    @Post('repairs')
    createRepair(@Body() data: CreateRepairDto) {
        return this.myMachineService.createRepair(data);
    }

    @Delete('repairs/:id')
    deleteRepair(@Param('id') id: string) {
        return this.myMachineService.deleteRepair(id);
    }

    @Post('repairs/:id/update') // Using Post for update if Frontend prefers, or Patch
    updateRepair(@Param('id') id: string, @Body() data: UpdateRepairDto) {
        return this.myMachineService.updateRepair(id, data);
    }

    // Stocks
    @Get('stocks')
    findAllStocks() {
        return this.myMachineService.findAllStocks();
    }

    @Get('stocks/:id')
    findStockById(@Param('id') id: string) {
        return this.myMachineService.findStockById(id);
    }

    @Post('stocks')
    createStock(@Body() data: any) {
        return this.myMachineService.createStock(data);
    }

    @Post('stocks/:id/update')
    updateStock(@Param('id') id: string, @Body() data: any) {
        return this.myMachineService.updateStock(id, data);
    }

    @Delete('stocks/:id')
    deleteStock(@Param('id') id: string) {
        return this.myMachineService.deleteStock(id);
    }

    // Seed Data
    @Public()
    @Post('seed')
    seedData() {
        return this.myMachineService.seed();
    }
}
