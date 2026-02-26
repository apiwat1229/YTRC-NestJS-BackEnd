import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrinterDepartment, PrinterUsageRecord, PrinterUserMapping } from '../entities/printer-usage.entity';
import {
    CreatePrinterDepartmentDto,
    SavePrinterUsageRecordDto,
    UpdatePrinterDepartmentDto,
    UpsertPrinterUserMappingDto
} from '../types';

@Injectable()
export class PrinterUsageService {
    constructor(
        @InjectRepository(PrinterDepartment)
        private deptRepo: Repository<PrinterDepartment>,
        @InjectRepository(PrinterUserMapping)
        private mappingRepo: Repository<PrinterUserMapping>,
        @InjectRepository(PrinterUsageRecord)
        private recordRepo: Repository<PrinterUsageRecord>
    ) { }

    async getDepartments() { return this.deptRepo.find({ order: { name: 'ASC' } }); }
    async createDepartment(data: CreatePrinterDepartmentDto) { return this.deptRepo.save(this.deptRepo.create(data as any)); }
    async updateDepartment(id: string, data: UpdatePrinterDepartmentDto) { await this.deptRepo.update(id, data as any); return this.deptRepo.findOne({ where: { id } }); }
    async deleteDepartment(id: string) { return this.deptRepo.delete(id); }

    async getMappings() { return this.mappingRepo.find({ relations: { department: true }, order: { userName: 'ASC' } }); }
    async upsertMapping(data: UpsertPrinterUserMappingDto) {
        const existing = await this.mappingRepo.findOne({ where: { userName: data.userName } });
        if (existing) { await this.mappingRepo.update(existing.id, { departmentId: data.departmentId }); return this.mappingRepo.findOne({ where: { userName: data.userName } }); }
        return this.mappingRepo.save(this.mappingRepo.create({ userName: data.userName, departmentId: data.departmentId }));
    }

    async saveUsageRecords(records: SavePrinterUsageRecordDto[]) {
        const results = [];
        for (const record of records) {
            const { period, userName, ...data } = record;
            const mapping = await this.mappingRepo.findOne({ where: { userName } });
            const serialNo = (data as any).serialNo || 'unknown';
            const existing = await this.recordRepo.findOne({ where: { period: new Date(period as any), userName, serialNo } as any });
            if (existing) {
                await this.recordRepo.update(existing.id, { ...data as any, departmentId: mapping?.departmentId || null });
                results.push(await this.recordRepo.findOne({ where: { id: existing.id } }));
            } else {
                const r = this.recordRepo.create({ ...data as any, period: new Date(period as any), userName, serialNo, departmentId: mapping?.departmentId || null });
                results.push(await this.recordRepo.save(r));
            }
        }
        return results;
    }

    async getHistory() { return this.recordRepo.find({ relations: { department: true }, order: { period: 'DESC' } }); }
    async deletePeriod(period: string) {
        const periodDate = new Date(decodeURIComponent(period));
        return this.recordRepo.delete({ period: periodDate } as any);
    }
}
