import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CpkAnalysis } from '../entities/cpk-analysis.entity';
import { CreateCpkAnalysisDto } from './dto/create-cpk-analysis.dto';

@Injectable()
export class CpkAnalysesService {
    constructor(@InjectRepository(CpkAnalysis) private repo: Repository<CpkAnalysis>) { }

    async create(createCpkAnalysisDto: CreateCpkAnalysisDto) {
        return this.repo.save(this.repo.create(createCpkAnalysisDto as any));
    }

    async findAll() {
        return this.repo.find({ order: { createdAt: 'DESC' }, select: ['id', 'title', 'createdAt'] });
    }

    async findOne(id: string) {
        return this.repo.findOne({ where: { id } });
    }

    async remove(id: string) {
        return this.repo.delete(id);
    }
}
