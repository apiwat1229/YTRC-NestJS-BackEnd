import { CreateJobOrderDto, UpdateJobOrderDto } from '../types';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    JOB_ORDERS_CREATE,
    JOB_ORDERS_DELETE,
    JOB_ORDERS_READ,
    JOB_ORDERS_UPDATE,
} from '../auth/constants/permissions';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { JobOrdersService } from './job-orders.service';

@Controller('job-orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class JobOrdersController {
    constructor(private readonly jobOrdersService: JobOrdersService) { }

    @Get()
    @Permissions(JOB_ORDERS_READ)
    findAll() {
        return this.jobOrdersService.findAll();
    }

    @Get(':id')
    @Permissions(JOB_ORDERS_READ)
    findOne(@Param('id') id: string) {
        return this.jobOrdersService.findOne(id);
    }

    @Post()
    @Permissions(JOB_ORDERS_CREATE)
    create(@Body() createJobOrderDto: CreateJobOrderDto) {
        return this.jobOrdersService.create(createJobOrderDto);
    }

    @Patch(':id')
    @Permissions(JOB_ORDERS_UPDATE)
    update(@Param('id') id: string, @Body() updateJobOrderDto: UpdateJobOrderDto) {
        return this.jobOrdersService.update(id, updateJobOrderDto);
    }

    @Delete(':id')
    @Permissions(JOB_ORDERS_DELETE)
    remove(@Param('id') id: string) {
        return this.jobOrdersService.remove(id);
    }

    @Post(':id/close')
    @Permissions(JOB_ORDERS_UPDATE)
    closeJob(@Param('id') id: string, @Body() productionInfo: { productionName: string; productionDate: string }) {
        return this.jobOrdersService.closeJob(id, productionInfo);
    }
}
