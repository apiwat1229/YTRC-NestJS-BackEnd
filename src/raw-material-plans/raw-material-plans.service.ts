import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { format, isValid, parse } from 'date-fns';
import { DataSource, Like, Repository } from 'typeorm';
import { RawMaterialPlan, RawMaterialPlanPoolDetail, RawMaterialPlanRow } from '../entities/raw-material-plan.entity';
import { CreateRawMaterialPlanDto } from './dto/create-raw-material-plan.dto';

@Injectable()
export class RawMaterialPlansService {
    constructor(
        @InjectRepository(RawMaterialPlan)
        private planRepo: Repository<RawMaterialPlan>,
        @InjectRepository(RawMaterialPlanRow)
        private rowRepo: Repository<RawMaterialPlanRow>,
        @InjectRepository(RawMaterialPlanPoolDetail)
        private poolDetailRepo: Repository<RawMaterialPlanPoolDetail>,
        private dataSource: DataSource
    ) { }

    private parseDate(dateStr: string | Date): Date {
        if (dateStr instanceof Date) return dateStr;
        if (!dateStr) return new Date();
        const parsed = parse(dateStr, 'dd MMM yy', new Date());
        if (isValid(parsed)) return parsed;
        const standard = new Date(dateStr);
        return isValid(standard) ? standard : new Date();
    }

    private cleanNumber(val: any): number | null {
        if (val === '-' || val === '' || val === null || val === undefined) return null;
        const num = Number(val);
        return isNaN(num) ? null : num;
    }

    private formatRows(rows: any[]) {
        let lastValidDate: Date | null = null;
        return (rows || []).map(row => {
            const currentDate = row.date ? this.parseDate(row.date) : lastValidDate;
            if (row.date) lastValidDate = currentDate;
            return {
                date: currentDate || new Date(),
                dayOfWeek: row.dayOfWeek,
                shift: row.shift,
                grade: row.grade,
                ratioUSS: this.cleanNumber(row.ratioUSS),
                ratioCL: this.cleanNumber(row.ratioCL),
                ratioBK: this.cleanNumber(row.ratioBK),
                productTarget: this.cleanNumber(row.productTarget),
                clConsumption: this.cleanNumber(row.clConsumption),
                ratioBorC: this.cleanNumber(row.ratioBorC),
                plan1Pool: Array.isArray(row.plan1Pool) ? row.plan1Pool.join(',') : row.plan1Pool,
                plan1Note: `Scoops: ${row.plan1Scoops || 0}, Grades: ${Array.isArray(row.plan1Grades) ? row.plan1Grades.join(',') : (row.plan1Grades || '')}`,
                plan2Pool: Array.isArray(row.plan2Pool) ? row.plan2Pool.join(',') : row.plan2Pool,
                plan2Note: `Scoops: ${row.plan2Scoops || 0}, Grades: ${Array.isArray(row.plan2Grades) ? row.plan2Grades.join(',') : (row.plan2Grades || '')}`,
                plan3Pool: Array.isArray(row.plan3Pool) ? row.plan3Pool.join(',') : row.plan3Pool,
                plan3Note: `Scoops: ${row.plan3Scoops || 0}, Grades: ${Array.isArray(row.plan3Grades) ? row.plan3Grades.join(',') : (row.plan3Grades || '')}`,
                cuttingPercent: this.cleanNumber(row.cuttingPercent),
                cuttingPalette: this.cleanNumber(row.cuttingPalette) !== null ? Math.round(Number(this.cleanNumber(row.cuttingPalette))) : null,
                remarks: row.remarks,
                specialIndicator: row.productionMode
            };
        });
    }

    private formatPoolDetails(poolDetails: any[]) {
        return (poolDetails || []).map(pool => ({
            poolNo: pool.poolNo,
            grossWeight: this.cleanNumber(pool.grossWeight),
            netWeight: this.cleanNumber(pool.netWeight),
            drc: this.cleanNumber(pool.drc),
            moisture: this.cleanNumber(pool.moisture),
            p0: this.cleanNumber(pool.p0),
            pri: this.cleanNumber(pool.pri),
            clearDate: pool.clearDate ? this.parseDate(pool.clearDate) : null,
            grade: Array.isArray(pool.grade) ? pool.grade.join(',') : pool.grade,
        }));
    }

    private transformPlan(plan: any) {
        if (!plan) return null;
        return {
            ...plan,
            rows: (plan.rows || []).map((row: any) => {
                const parseNote = (note: string | null) => {
                    const scoopsMatch = note?.match(/Scoops: (\d+)/);
                    const gradesMatch = note?.match(/Grades: (.*)/);
                    return {
                        scoops: scoopsMatch ? Number(scoopsMatch[1]) : 0,
                        grades: gradesMatch && gradesMatch[1] ? gradesMatch[1] : ''
                    };
                };
                const p1 = parseNote(row.plan1Note);
                const p2 = parseNote(row.plan2Note);
                const p3 = parseNote(row.plan3Note);
                return {
                    ...row,
                    productionMode: row.specialIndicator || 'normal',
                    plan1Scoops: p1.scoops,
                    plan1Grades: p1.grades,
                    plan2Scoops: p2.scoops,
                    plan2Grades: p2.grades,
                    plan3Scoops: p3.scoops,
                    plan3Grades: p3.grades
                };
            })
        };
    }

    async create(createDto: CreateRawMaterialPlanDto) {
        const { rows, poolDetails, issueBy, verifiedBy, issuedDate, ...mainRemaining } = createDto;
        const { ...mainData } = mainRemaining as any;
        delete (mainData as any).id;
        delete (mainData as any).status;
        delete (mainData as any).createdAt;
        delete (mainData as any).updatedAt;

        try {
            return await this.dataSource.transaction(async manager => {
                const planEntity = manager.create(RawMaterialPlan, {
                    ...mainData,
                    issuedDate: this.parseDate(issuedDate),
                    creator: issueBy || 'System',
                    checker: verifiedBy,
                    status: 'DRAFT'
                });
                const savedPlan = await manager.save(planEntity);

                if (rows && rows.length > 0) {
                    const rowEntities = this.formatRows(rows).map(r => manager.create(RawMaterialPlanRow, { ...r, planId: savedPlan.id }));
                    await manager.save(RawMaterialPlanRow, rowEntities);
                }

                if (poolDetails && poolDetails.length > 0) {
                    const poolEntities = this.formatPoolDetails(poolDetails).map(p => manager.create(RawMaterialPlanPoolDetail, { ...p, planId: savedPlan.id } as any));
                    await manager.save(RawMaterialPlanPoolDetail, poolEntities);
                }

                return this.findOne(savedPlan.id);
            });
        } catch (error: any) {
            console.error('[RawMaterialPlansService] Error creating plan:', error);
            if (error.code === '23505') throw new ConflictException(`Plan number "${createDto.planNo}" already exists.`);
            throw new InternalServerErrorException(`Failed to create plan: ${error.message}`);
        }
    }

    async findAll() {
        const plans = await this.planRepo.find({ order: { createdAt: 'DESC' }, relations: { rows: true, poolDetails: true } });
        return plans.map(plan => this.transformPlan(plan));
    }

    async findOne(id: string) {
        const plan = await this.planRepo.findOne({ where: { id }, relations: { rows: true, poolDetails: true } });
        return this.transformPlan(plan);
    }

    async update(id: string, updateDto: CreateRawMaterialPlanDto) {
        const { rows, poolDetails, issueBy, verifiedBy, issuedDate, ...mainRemaining } = updateDto;
        const { ...mainData } = mainRemaining as any;
        delete (mainData as any).id;
        delete (mainData as any).status;
        delete (mainData as any).createdAt;
        delete (mainData as any).updatedAt;

        try {
            return await this.dataSource.transaction(async manager => {
                await manager.delete(RawMaterialPlanRow, { planId: id });
                await manager.delete(RawMaterialPlanPoolDetail, { planId: id });
                await manager.update(RawMaterialPlan, id, {
                    ...mainData,
                    creator: issueBy,
                    checker: verifiedBy,
                    issuedDate: this.parseDate(issuedDate)
                });

                if (rows && rows.length > 0) {
                    const rowEntities = this.formatRows(rows).map(r => manager.create(RawMaterialPlanRow, { ...r, planId: id }));
                    await manager.save(RawMaterialPlanRow, rowEntities);
                }

                if (poolDetails && poolDetails.length > 0) {
                    const poolEntities = this.formatPoolDetails(poolDetails).map(p => manager.create(RawMaterialPlanPoolDetail, { ...p, planId: id } as any));
                    await manager.save(RawMaterialPlanPoolDetail, poolEntities);
                }

                return this.findOne(id);
            });
        } catch (error: any) {
            console.error('[RawMaterialPlansService] Error updating plan:', error);
            throw new InternalServerErrorException(`Failed to update plan: ${error.message}`);
        }
    }

    async generateNextPlanNo() {
        const today = new Date();
        const dateStr = format(today, 'yyyyMMdd');
        const prefix = `RMP-${dateStr}-`;
        const latestPlan = await this.planRepo.findOne({ where: { planNo: Like(`${prefix}%`) }, order: { planNo: 'DESC' }, select: ['planNo'] });
        if (!latestPlan) return `${prefix}001`;
        const parts = latestPlan.planNo.split('-');
        const lastPart = parts[parts.length - 1];
        const currentNum = parseInt(lastPart, 10);
        if (isNaN(currentNum)) return `${prefix}001`;
        const nextNum = (currentNum + 1).toString().padStart(3, '0');
        return `${prefix}${nextNum}`;
    }

    async remove(id: string) {
        const result = await this.planRepo.delete(id);
        if (result.affected === 0) throw new NotFoundException('Plan not found');
        return result;
    }
}
