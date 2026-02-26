import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobOrder, JobOrderLog } from '../entities/job-order.entity';
import { JobOrdersController } from './job-orders.controller';
import { JobOrdersService } from './job-orders.service';

@Module({
    imports: [TypeOrmModule.forFeature([JobOrder, JobOrderLog])],
    controllers: [JobOrdersController],
    providers: [JobOrdersService],
    exports: [JobOrdersService],
})
export class JobOrdersModule { }
