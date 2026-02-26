import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockCategory } from '../entities/maintenance.entity';
import { CreateStockCategoryDto, UpdateStockCategoryDto } from './dto/stock-category.dto';

@Injectable()
export class StockCategoryService {
    constructor(@InjectRepository(StockCategory) private repo: Repository<StockCategory>) { }
    async findAll() { return this.repo.find({ order: { name: 'ASC' } }); }
    async findOne(id: string) { return this.repo.findOne({ where: { id } }); }
    async create(dto: CreateStockCategoryDto) { return this.repo.save(this.repo.create(dto as any)); }
    async update(id: string, dto: UpdateStockCategoryDto) { await this.repo.update(id, dto as any); return this.repo.findOne({ where: { id } }); }
    async remove(id: string) { return this.repo.delete(id); }
}
