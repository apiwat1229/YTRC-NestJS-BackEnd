import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { RubberType } from '../entities/rubber-type.entity';

@Injectable()
export class RubberTypesService {
    constructor(
        @InjectRepository(RubberType)
        private rubberTypeRepo: Repository<RubberType>
    ) { }

    async create(data: any) {
        const rubberType = this.rubberTypeRepo.create({
            code: data.code, name: data.name, category: data.category, description: data.description,
            is_active: data.status === 'ACTIVE' || data.is_active === true,
        });
        return this.rubberTypeRepo.save(rubberType);
    }

    async findAll(includeDeleted = false) {
        return this.rubberTypeRepo.find({
            where: includeDeleted ? {} : { deletedAt: IsNull() } as any,
            order: { code: 'ASC' },
        });
    }

    async findOne(id: string) {
        const rt = await this.rubberTypeRepo.findOne({ where: { id } });
        if (!rt) throw new NotFoundException(`RubberType ${id} not found`);
        return rt;
    }

    async update(id: string, data: any) {
        await this.findOne(id);
        await this.rubberTypeRepo.update(id, {
            code: data.code, name: data.name, category: data.category, description: data.description,
            is_active: data.status ? data.status === 'ACTIVE' : data.is_active,
        });
        return this.findOne(id);
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.rubberTypeRepo.delete(id);
    }

    async softDelete(id: string, userId: string) {
        await this.findOne(id);
        return this.rubberTypeRepo.update(id, { deletedAt: new Date(), deletedBy: userId } as any);
    }

    async restore(id: string) {
        return this.rubberTypeRepo.update(id, { deletedAt: null, deletedBy: null } as any);
    }
}
