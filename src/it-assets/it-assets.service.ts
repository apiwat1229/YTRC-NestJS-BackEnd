import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITAsset } from '../entities/it-asset.entity';
import { CreateITAssetDto, UpdateITAssetDto } from '../types';

@Injectable()
export class ITAssetsService {
    constructor(@InjectRepository(ITAsset) private repo: Repository<ITAsset>) { }
    async create(createDto: CreateITAssetDto) { return this.repo.save(this.repo.create(createDto as any)); }
    async findAll() { return this.repo.find({ order: { createdAt: 'DESC' } }); }
    async findOne(id: string) { return this.repo.findOne({ where: { id } }); }
    async update(id: string, updateDto: UpdateITAssetDto) { await this.repo.update(id, updateDto as any); return this.repo.findOne({ where: { id } }); }
    async remove(id: string) { return this.repo.delete(id); }
    async updateImage(id: string, imagePath: string) { await this.repo.update(id, { image: imagePath }); return this.repo.findOne({ where: { id } }); }
}
