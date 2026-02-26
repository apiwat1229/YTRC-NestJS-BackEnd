import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageLocation } from '../entities/maintenance.entity';
import { CreateStorageLocationDto, UpdateStorageLocationDto } from './dto/storage-location.dto';

@Injectable()
export class StorageLocationService {
    constructor(@InjectRepository(StorageLocation) private repo: Repository<StorageLocation>) { }
    async findAll() { return this.repo.find({ order: { name: 'ASC' } }); }
    async findOne(id: string) { return this.repo.findOne({ where: { id } }); }
    async create(dto: CreateStorageLocationDto) { return this.repo.save(this.repo.create(dto as any)); }
    async update(id: string, dto: UpdateStorageLocationDto) { await this.repo.update(id, dto as any); return this.repo.findOne({ where: { id } }); }
    async remove(id: string) { return this.repo.delete(id); }
}
