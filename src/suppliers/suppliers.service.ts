import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { RubberType } from '../entities/rubber-type.entity';
import { Supplier } from '../entities/supplier.entity';
import { CreateSupplierDto, UpdateSupplierDto } from '../types';

@Injectable()
export class SuppliersService {
    constructor(
        @InjectRepository(Supplier)
        private supplierRepo: Repository<Supplier>,
        @InjectRepository(RubberType)
        private rubberTypeRepo: Repository<RubberType>
    ) { }

    async create(data: CreateSupplierDto) {
        const supplier = this.supplierRepo.create({
            code: data.code,
            name: data.name,
            firstName: data.firstName,
            lastName: data.lastName,
            title: data.title,
            taxId: data.taxId,
            address: data.address,
            phone: data.phone,
            email: data.email,
            status: data.status || 'ACTIVE',
            avatar: data.avatar,
            zipCode: data.zipCode,
            certificateNumber: data.certificateNumber,
            certificateExpire: data.certificateExpire ? new Date(data.certificateExpire) : undefined,
            score: data.score,
            eudrQuotaUsed: data.eudrQuotaUsed,
            eudrQuotaCurrent: data.eudrQuotaCurrent,
            rubberTypeCodes: data.rubberTypeCodes || [],
            notes: data.notes,
            provinceId: data.provinceId,
            districtId: data.districtId,
            subdistrictId: data.subdistrictId,
        } as any);
        return this.supplierRepo.save(supplier);
    }

    async findAll(includeDeleted = false) {
        const suppliers = await this.supplierRepo.find({
            where: includeDeleted ? {} : { deletedAt: IsNull() } as any,
            order: { createdAt: 'DESC' },
        });

        const allRubberTypeCodes = [...new Set(suppliers.flatMap(s => s.rubberTypeCodes || []))];
        const rubberTypes = allRubberTypeCodes.length
            ? await this.rubberTypeRepo.findBy({ code: In(allRubberTypeCodes) })
            : [];
        const rubberTypeMap = new Map(rubberTypes.map(rt => [rt.code, rt]));

        return suppliers.map(supplier => ({
            ...supplier,
            rubberTypeDetails: (supplier.rubberTypeCodes || []).map(code => {
                const type = rubberTypeMap.get(code);
                return { code, name: type?.name || code, category: type?.category || 'Other' };
            }),
        }));
    }

    async findOne(id: string) {
        const supplier = await this.supplierRepo.findOne({ where: { id } });
        if (!supplier) throw new NotFoundException(`Supplier ${id} not found`);
        return supplier;
    }

    async update(id: string, data: UpdateSupplierDto) {
        await this.findOne(id);
        await this.supplierRepo.update(id, data as any);
        return this.findOne(id);
    }

    async remove(id: string) {
        return this.supplierRepo.delete(id);
    }

    async softDelete(id: string, userId: string) {
        await this.findOne(id);
        return this.supplierRepo.update(id, { deletedAt: new Date(), deletedBy: userId } as any);
    }

    async restore(id: string) {
        await this.supplierRepo.findOne({ where: { id } });
        return this.supplierRepo.update(id, { deletedAt: null, deletedBy: null } as any);
    }
}
