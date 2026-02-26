import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Machine, MaintenanceStock, RepairLog, StockCategory, StorageLocation } from '../entities/maintenance.entity';

@Injectable()
export class MyMachineService {
    constructor(
        @InjectRepository(Machine) private machineRepo: Repository<Machine>,
        @InjectRepository(RepairLog) private repairRepo: Repository<RepairLog>,
        @InjectRepository(MaintenanceStock) private stockRepo: Repository<MaintenanceStock>,
        @InjectRepository(StockCategory) private categoryRepo: Repository<StockCategory>,
        @InjectRepository(StorageLocation) private locationRepo: Repository<StorageLocation>
    ) { }

    async seed() {
        const results: any = { machines: 'skipped', stocks: 'skipped', repairs: 'skipped' };
        const machineCount = await this.machineRepo.count();
        if (machineCount === 0) {
            const mockMachines = [
                { name: 'Packing', model: 'Packing Station', location: 'Warehouse', status: 'Active' },
                { name: 'BC-5 Mixing', model: 'Batch Mixer', location: 'Mixing Zone', status: 'Active' },
                { name: 'BC-4 Mixing', model: 'Batch Mixer', location: 'Mixing Zone', status: 'Maintenance' },
                { name: 'BC-5 Pre Cleaning', model: 'Batch Cleaner', location: 'Cleaning Bay', status: 'Active' },
                { name: 'SC Jumbo Mixing', model: 'Jumbo Mixer', location: 'Mixing Zone', status: 'Active' },
                { name: 'SC-1 Mixing', model: 'Standard Mixer', location: 'Mixing Zone', status: 'Active' },
            ];
            await this.machineRepo.save(mockMachines.map(m => this.machineRepo.create(m)));
            results.machines = `seeded ${mockMachines.length}`;
        }
        const stockCount = await this.stockRepo.count();
        if (stockCount === 0) {
            const mockStocks = [
                { code: 'SP-WHT', name: 'Spray paint WHITE', nameEN: 'Spray paint WHITE', nameTH: 'สีสเปรย์ สีขาว', category: 'Consumables', location: 'Store A', qty: 50, price: 42.00, unit: 'can', minQty: 10 },
                { code: 'BR-204', name: 'Bearing NTN UCP 204-012', nameEN: 'Bearing NTN UCP 204-012', nameTH: 'ตลับลูกปืน NTN', category: 'Bearings', location: 'Shelf C', qty: 20, price: 205.00, unit: 'pcs', minQty: 5 },
                { code: 'GR-PTT2', name: 'PTT EP Grease # 2', nameEN: 'PTT EP Grease # 2', nameTH: 'จารบี PTT EP เบอร์ 2', category: 'Lubricants', location: 'Chem Store', qty: 10, price: 2400.00, unit: 'pail', minQty: 3 },
            ];
            await this.stockRepo.save(mockStocks.map(s => this.stockRepo.create(s)));
            results.stocks = `seeded ${mockStocks.length}`;
        }
        return { message: 'Seed execution completed', results };
    }

    async findAllMachines() { return this.machineRepo.find({ order: { name: 'ASC' } }); }
    async findMachineById(id: string) {
        const machine = await this.machineRepo.findOne({ where: { id }, relations: { repairs: true } });
        if (!machine) throw new NotFoundException('Machine not found');
        return machine;
    }
    async createMachine(data: any) { return this.machineRepo.save(this.machineRepo.create(data)); }
    async updateMachine(id: string, data: any) { await this.machineRepo.update(id, data); return this.machineRepo.findOne({ where: { id } }); }
    async deleteMachine(id: string) { return this.machineRepo.delete(id); }

    async findAllRepairs() { return this.repairRepo.find({ order: { date: 'DESC' } }); }
    async findRepairById(id: string) {
        const repair = await this.repairRepo.findOne({ where: { id } });
        if (!repair) throw new NotFoundException('Repair log not found');
        return repair;
    }
    async createRepair(data: any) {
        const { id, timestamp, createdAt, updatedAt, ...rest } = data;
        if (rest.parts && Array.isArray(rest.parts)) {
            for (const part of rest.parts) {
                const stockItem = await this.stockRepo.findOne({ where: [{ name: part.name }, { nameEN: part.name }] as any });
                if (stockItem) await this.stockRepo.decrement({ id: stockItem.id }, 'qty', part.qty);
            }
        }
        return this.repairRepo.save(this.repairRepo.create({ ...rest, status: rest.status || 'IN_PROGRESS' }));
    }
    async updateRepair(id: string, data: any) {
        const { id: _id, timestamp, createdAt, updatedAt, ...rest } = data;
        const oldRepair = await this.repairRepo.findOne({ where: { id } });
        if (!oldRepair) throw new NotFoundException('Repair not found');
        const oldParts = (oldRepair.parts as any[]) || [];
        for (const part of oldParts) {
            const stockItem = await this.stockRepo.findOne({ where: [{ name: part.name }, { nameEN: part.name }] as any });
            if (stockItem) await this.stockRepo.increment({ id: stockItem.id }, 'qty', part.qty);
        }
        const newParts = (rest.parts as any[]) || [];
        for (const part of newParts) {
            const stockItem = await this.stockRepo.findOne({ where: [{ name: part.name }, { nameEN: part.name }] as any });
            if (stockItem) await this.stockRepo.decrement({ id: stockItem.id }, 'qty', part.qty);
        }
        await this.repairRepo.update(id, rest);
        return this.repairRepo.findOne({ where: { id } });
    }
    async deleteRepair(id: string) {
        const repair = await this.repairRepo.findOne({ where: { id } });
        if (!repair) throw new NotFoundException('Repair not found');
        const parts = (repair.parts as any[]) || [];
        for (const part of parts) {
            const stockItem = await this.stockRepo.findOne({ where: [{ name: part.name }, { nameEN: part.name }] as any });
            if (stockItem) await this.stockRepo.increment({ id: stockItem.id }, 'qty', part.qty);
        }
        return this.repairRepo.delete(id);
    }

    async findAllStocks() { return this.stockRepo.find({ order: { name: 'ASC' } }); }
    async findStockById(id: string) { return this.stockRepo.findOne({ where: { id } }); }
    async createStock(data: any) { return this.stockRepo.save(this.stockRepo.create(data)); }
    async updateStock(id: string, data: any) { await this.stockRepo.update(id, data); return this.stockRepo.findOne({ where: { id } }); }
    async deleteStock(id: string) { return this.stockRepo.delete(id); }
}
