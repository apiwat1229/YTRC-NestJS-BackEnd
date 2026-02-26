import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Pool, PoolItem } from '../entities/pool.entity';

@Injectable()
export class PoolsService {
    constructor(
        @InjectRepository(Pool)
        private poolRepo: Repository<Pool>,
        @InjectRepository(PoolItem)
        private poolItemRepo: Repository<PoolItem>,
        private dataSource: DataSource
    ) { }

    async listPools() {
        const pools = await this.poolRepo.find({ order: { name: 'ASC' } });
        return Promise.all(pools.map(async pool => {
            const itemCount = await this.poolItemRepo.count({ where: { poolId: pool.id } });
            return { ...pool, _count: { items: itemCount } };
        }));
    }

    async getPool(id: string) {
        const pool = await this.poolRepo.findOne({ where: { id }, relations: { items: true } });
        if (!pool) throw new NotFoundException('Pool not found');
        return pool;
    }

    async createPool(data: any) {
        const pool = this.poolRepo.create(data);
        return this.poolRepo.save(pool);
    }

    async updatePool(id: string, data: any) {
        await this.poolRepo.update(id, data);
        return this.poolRepo.findOne({ where: { id }, relations: { items: true } });
    }

    async addItems(poolId: string, items: any[]) {
        const pool = await this.poolRepo.findOne({ where: { id: poolId } });
        if (!pool) throw new NotFoundException('Pool not found');
        if (pool.status === 'closed') throw new BadRequestException('Cannot add items to a closed pool');

        return this.dataSource.transaction(async manager => {
            const poolItems = items.map(item => manager.create(PoolItem, {
                poolId,
                bookingId: item.booking_id || item.id,
                lotNumber: item.lot_number || item.lotNo || '-',
                supplierName: item.supplier_name || item.supplierName || '-',
                supplierCode: item.supplier_code || item.supplierCode || '-',
                date: new Date(item.date),
                netWeight: Number(item.net_weight || item.displayWeight || 0),
                grossWeight: Number(item.gross_weight || item.weightIn || 0),
                grade: item.grade || '-',
                rubberType: item.rubber_type || item.displayRubberType || '-'
            }));
            await manager.save(poolItems);

            const totalNet = items.reduce((sum, i) => sum + Number(i.net_weight || i.displayWeight || 0), 0);
            const totalGross = items.reduce((sum, i) => sum + Number(i.gross_weight || i.weightIn || 0), 0);

            const updateData: any = { totalWeight: pool.totalWeight + totalNet, totalGrossWeight: pool.totalGrossWeight + totalGross };
            if (pool.status === 'empty' && items.length > 0) {
                updateData.status = 'open';
                updateData.fillingDate = new Date();
                updateData.grade = items[0].grade || '-';
                updateData.rubberType = items[0].rubber_type || items[0].displayRubberType || '-';
            }

            await manager.update(Pool, poolId, updateData);
            return manager.findOne(Pool, { where: { id: poolId }, relations: { items: true } });
        });
    }

    async removeItem(poolId: string, bookingId: string) {
        const item = await this.poolItemRepo.findOne({ where: { poolId, bookingId } });
        if (!item) throw new NotFoundException('Item not found in this pool');

        return this.dataSource.transaction(async manager => {
            await manager.delete(PoolItem, item.id);
            const itemCount = await manager.count(PoolItem, { where: { poolId } });
            const updateData: any = { totalWeight: Math.max(0, (await manager.findOne(Pool, { where: { id: poolId } }))!.totalWeight - item.netWeight), totalGrossWeight: Math.max(0, (await manager.findOne(Pool, { where: { id: poolId } }))!.totalGrossWeight - item.grossWeight) };
            if (itemCount === 0) { updateData.status = 'empty'; updateData.grade = '-'; updateData.rubberType = '-'; updateData.fillingDate = null; updateData.totalWeight = 0; updateData.totalGrossWeight = 0; }
            await manager.update(Pool, poolId, updateData);
            return manager.findOne(Pool, { where: { id: poolId } });
        });
    }

    async closePool(poolId: string, closeDate?: Date) {
        await this.poolRepo.update(poolId, { status: 'closed', closeDate: closeDate || new Date() });
        return this.poolRepo.findOne({ where: { id: poolId } });
    }

    async reopenPool(poolId: string) {
        await this.poolRepo.update(poolId, { status: 'open', closeDate: null });
        return this.poolRepo.findOne({ where: { id: poolId } });
    }

    async seedPools() {
        const count = await this.poolRepo.count();
        if (count > 0) return { message: 'Already seeded', count };
        const pools = Array.from({ length: 24 }, (_, i) => this.poolRepo.create({ name: `Pool ${i + 1}`, status: 'empty', capacity: 3000 }));
        await this.poolRepo.save(pools);
        return { message: 'Seeded 24 pools', count: 24 };
    }
}
