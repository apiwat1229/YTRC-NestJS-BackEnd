import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { District, Province, Subdistrict } from '../entities/master.entity';
import { RubberType } from '../entities/rubber-type.entity';

@Injectable()
export class MasterService {
    constructor(
        @InjectRepository(Province)
        private provinceRepo: Repository<Province>,
        @InjectRepository(District)
        private districtRepo: Repository<District>,
        @InjectRepository(Subdistrict)
        private subdistrictRepo: Repository<Subdistrict>,
        @InjectRepository(RubberType)
        private rubberTypeRepo: Repository<RubberType>
    ) { }

    async getProvinces() { return this.provinceRepo.find({ order: { name_th: 'ASC' } }); }
    async getDistricts(provinceId: number) { return this.districtRepo.find({ where: { provinceId }, order: { name_th: 'ASC' } }); }
    async getSubdistricts(districtId: number) { return this.subdistrictRepo.find({ where: { districtId }, order: { name_th: 'ASC' } }); }
    async getRubberTypes() { return this.rubberTypeRepo.find({ where: { is_active: true }, order: { code: 'ASC' } }); }
}
