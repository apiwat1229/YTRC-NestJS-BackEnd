import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { JobOrder, JobOrderLog } from '../entities/job-order.entity';
import { CreateJobOrderDto, UpdateJobOrderDto } from '../types';

@Injectable()
export class JobOrdersService {
    private readonly logger = new Logger(JobOrdersService.name);
    constructor(
        @InjectRepository(JobOrder)
        private jobOrderRepo: Repository<JobOrder>,
        @InjectRepository(JobOrderLog)
        private logRepo: Repository<JobOrderLog>,
        private dataSource: DataSource
    ) { }

    async findAll() {
        return this.jobOrderRepo.find({ relations: { logs: true }, order: { createdAt: 'DESC' } });
    }

    async findOne(id: string) {
        const jobOrder = await this.jobOrderRepo.findOne({ where: { id }, relations: { logs: true } });
        if (!jobOrder) throw new NotFoundException(`JobOrder with ID ${id} not found`);
        return jobOrder;
    }

    async create(data: CreateJobOrderDto) {
        try {
            const { logs, ...jobOrderData } = data;
            return await this.dataSource.transaction(async manager => {
                const jobOrder = manager.create(JobOrder, {
                    ...jobOrderData as any,
                    bookNo: jobOrderData.bookNo || '',
                    no: jobOrderData.no || 0,
                    qaDate: new Date(jobOrderData.qaDate)
                });
                const saved = await manager.save(jobOrder);

                if (logs && logs.length > 0) {
                    const logEntities = logs.map(log => manager.create(JobOrderLog, {
                        ...log as any,
                        date: new Date(log.date),
                        jobOrderId: saved.id
                    }));
                    await manager.save(JobOrderLog, logEntities);
                }
                return this.findOne(saved.id);
            });
        } catch (error: any) {
            this.logger.error(`Failed to create job order: ${error.message}`, error.stack);
            if (error.code === '23505') throw new BadRequestException(`Job Order number already exists: ${data.jobOrderNo}`);
            throw new InternalServerErrorException(error.message || 'Failed to create job order');
        }
    }

    async update(id: string, data: UpdateJobOrderDto) {
        try {
            const { logs, ...jobOrderData } = data;
            await this.findOne(id);
            const updateData: any = { ...jobOrderData };
            delete updateData.id;
            if (jobOrderData.qaDate) updateData.qaDate = new Date(jobOrderData.qaDate);
            if ((jobOrderData as any).productionDate) updateData.productionDate = new Date((jobOrderData as any).productionDate);

            return await this.dataSource.transaction(async manager => {
                await manager.delete(JobOrderLog, { jobOrderId: id });
                await manager.update(JobOrder, id, updateData);

                if (logs && logs.length > 0) {
                    const logEntities = logs.map(log => manager.create(JobOrderLog, {
                        ...log as any,
                        date: new Date(log.date),
                        jobOrderId: id
                    }));
                    await manager.save(JobOrderLog, logEntities);
                }
                return this.findOne(id);
            });
        } catch (error: any) {
            this.logger.error(`Failed to update job order ${id}: ${error.message}`, error.stack);
            if (error.code === '23505') throw new BadRequestException('Job Order number already exists');
            throw new InternalServerErrorException(error.message || 'Failed to update job order');
        }
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.dataSource.transaction(async manager => {
            await manager.delete(JobOrderLog, { jobOrderId: id });
            return manager.delete(JobOrder, id);
        });
    }

    async closeJob(id: string, productionInfo: { productionName: string; productionDate: string }) {
        await this.findOne(id);
        await this.jobOrderRepo.update(id, {
            isClosed: true,
            productionName: productionInfo.productionName,
            productionDate: new Date(productionInfo.productionDate)
        } as any);
        return this.findOne(id);
    }
}
