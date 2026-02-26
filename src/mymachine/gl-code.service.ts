import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GLCode } from '../entities/maintenance.entity';
import { CreateGLCodeDto, UpdateGLCodeDto } from './dto/gl-code.dto';

@Injectable()
export class GLCodeService {
    constructor(@InjectRepository(GLCode) private repo: Repository<GLCode>) { }
    async findAll() { return this.repo.find({ order: { transactionId: 'ASC' } }); }
    async findOne(id: string) { return this.repo.findOne({ where: { id } }); }
    async create(createDto: CreateGLCodeDto) { return this.repo.save(this.repo.create({ transactionId: createDto.transactionId, description: createDto.description, code: createDto.code, purpose: createDto.purpose })); }
    async update(id: string, updateDto: UpdateGLCodeDto) { await this.repo.update(id, updateDto as any); return this.repo.findOne({ where: { id } }); }
    async remove(id: string) { return this.repo.delete(id); }
}
