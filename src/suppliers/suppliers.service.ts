import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { District, Province, Subdistrict } from '../entities/master.entity';
import { RubberType } from '../entities/rubber-type.entity';
import { Supplier } from '../entities/supplier.entity';
import { CreateSupplierDto, UpdateSupplierDto } from '../types';

@Injectable()
export class SuppliersService {
    constructor(
        @InjectRepository(Supplier)
        private supplierRepo: Repository<Supplier>,
        @InjectRepository(RubberType)
        private rubberTypeRepo: Repository<RubberType>,
        @InjectRepository(Province)
        private provinceRepo: Repository<Province>,
        @InjectRepository(District)
        private districtRepo: Repository<District>,
        @InjectRepository(Subdistrict)
        private subdistrictRepo: Repository<Subdistrict>,
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

        const provinceIds = [...new Set(suppliers.map(s => s.provinceId).filter(Boolean))] as number[];
        const districtIds = [...new Set(suppliers.map(s => s.districtId).filter(Boolean))] as number[];
        const subdistrictIds = [...new Set(suppliers.map(s => s.subdistrictId).filter(Boolean))] as number[];

        const [provinces, districts, subdistricts] = await Promise.all([
            provinceIds.length ? this.provinceRepo.findBy({ id: In(provinceIds) }) : [],
            districtIds.length ? this.districtRepo.findBy({ id: In(districtIds) }) : [],
            subdistrictIds.length ? this.subdistrictRepo.findBy({ id: In(subdistrictIds) }) : [],
        ]);

        const provinceMap = new Map<number, Province>(provinces.map(p => [p.id, p] as [number, Province]));
        const districtMap = new Map<number, District>(districts.map(d => [d.id, d] as [number, District]));
        const subdistrictMap = new Map<number, Subdistrict>(subdistricts.map(s => [s.id, s] as [number, Subdistrict]));

        const allRubberTypeCodes = [...new Set(suppliers.flatMap(s => s.rubberTypeCodes || []))];
        const rubberTypes = allRubberTypeCodes.length
            ? await this.rubberTypeRepo.findBy({ code: In(allRubberTypeCodes) })
            : [];
        const rubberTypeMap = new Map<string, RubberType>(rubberTypes.map(rt => [rt.code, rt] as [string, RubberType]));

        return suppliers.map(supplier => ({
            ...supplier,
            province: supplier.provinceId ? (provinceMap.get(supplier.provinceId) || null) : null,
            district: supplier.districtId ? (districtMap.get(supplier.districtId) || null) : null,
            subdistrict: supplier.subdistrictId ? (subdistrictMap.get(supplier.subdistrictId) || null) : null,
            rubberTypeDetails: (supplier.rubberTypeCodes || []).map(code => {
                const type = rubberTypeMap.get(code);
                return { code, name: type?.name || code, category: type?.category || 'Other' };
            }),
        }));
    }

    async findOne(id: string) {
        const supplier = await this.supplierRepo.findOne({ where: { id } });
        if (!supplier) throw new NotFoundException(`Supplier ${id} not found`);

        const [province, district, subdistrict] = await Promise.all([
            supplier.provinceId ? this.provinceRepo.findOne({ where: { id: supplier.provinceId } }) : null,
            supplier.districtId ? this.districtRepo.findOne({ where: { id: supplier.districtId } }) : null,
            supplier.subdistrictId ? this.subdistrictRepo.findOne({ where: { id: supplier.subdistrictId } }) : null,
        ]);

        return { ...supplier, province, district, subdistrict };
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
