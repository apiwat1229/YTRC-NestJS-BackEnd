import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('provinces')
export class Province {
    @PrimaryColumn({ type: 'int' })
    id: number;

    @Column({ nullable: true })
    name_th: string;

    @Column({ nullable: true })
    name_en: string;

    @Column({ nullable: true })
    geography_id: number;
}

@Entity('districts')
export class District {
    @PrimaryColumn({ type: 'int' })
    id: number;

    @Column({ nullable: true })
    name_th: string;

    @Column({ nullable: true })
    name_en: string;

    @Column({ nullable: true })
    province_id: number;

    get provinceId(): number { return this.province_id; }
    set provinceId(val: number) { this.province_id = val; }
}

@Entity('subdistricts')
export class Subdistrict {
    @PrimaryColumn({ type: 'int' })
    id: number;

    @Column({ nullable: true })
    name_th: string;

    @Column({ nullable: true })
    name_en: string;

    @Column({ nullable: true })
    district_id: number;

    @Column({ nullable: true })
    zip_code: string;

    get districtId(): number { return this.district_id; }
    set districtId(val: number) { this.district_id = val; }
}
