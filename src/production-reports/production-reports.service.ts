import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ProductionReport, ProductionReportRow } from '../entities/production-report.entity';
import { CreateProductionReportDto } from './dto/create-production-report.dto';

@Injectable()
export class ProductionReportsService {
    constructor(
        @InjectRepository(ProductionReport)
        private reportRepo: Repository<ProductionReport>,
        @InjectRepository(ProductionReportRow)
        private rowRepo: Repository<ProductionReportRow>,
        private dataSource: DataSource
    ) { }

    async create(createDto: CreateProductionReportDto) {
        const { rows, ...mainData } = createDto;
        try {
            return await this.dataSource.transaction(async manager => {
                const report = manager.create(ProductionReport, {
                    ...mainData as any,
                    productionDate: new Date((mainData as any).productionDate),
                    issuedAt: (mainData as any).issuedAt ? new Date((mainData as any).issuedAt) : new Date()
                });
                const saved = await manager.save(report);

                if (rows?.length) {
                    const rowEntities = (rows as any[]).map(r => manager.create(ProductionReportRow, { ...r, reportId: saved.id }));
                    await manager.save(ProductionReportRow, rowEntities);
                }

                return this.findOne(saved.id);
            });
        } catch (error: any) {
            console.error('[ProductionReportsService] Error creating report:', error);
            throw new InternalServerErrorException(`Failed to create report: ${error.message || 'Unknown error'}`);
        }
    }

    async findAll() {
        return this.reportRepo.find({ order: { createdAt: 'DESC' }, relations: { rows: true } });
    }

    async findOne(id: string) {
        return this.reportRepo.findOne({ where: { id }, relations: { rows: true } });
    }

    async update(id: string, updateDto: CreateProductionReportDto) {
        const { rows, ...mainData } = updateDto;
        try {
            return await this.dataSource.transaction(async manager => {
                await manager.delete(ProductionReportRow, { reportId: id });
                await manager.update(ProductionReport, id, {
                    ...mainData as any,
                    productionDate: new Date((mainData as any).productionDate),
                    issuedAt: (mainData as any).issuedAt ? new Date((mainData as any).issuedAt) : undefined
                });

                if (rows?.length) {
                    const rowEntities = (rows as any[]).map(r => manager.create(ProductionReportRow, { ...r, reportId: id }));
                    await manager.save(ProductionReportRow, rowEntities);
                }

                return this.findOne(id);
            });
        } catch (error: any) {
            console.error('[ProductionReportsService] Error updating report:', error);
            throw new InternalServerErrorException(`Failed to update report: ${error.message || 'Unknown error'}`);
        }
    }

    async remove(id: string) {
        try {
            return await this.reportRepo.delete(id);
        } catch (error: any) {
            console.error('[ProductionReportsService] Error deleting report:', error);
            throw new InternalServerErrorException(`Failed to delete report: ${error.message || 'Unknown error'}`);
        }
    }
}
