import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('provinces')
export class Province {
    @PrimaryColumn({ type: 'int' })
    id: number;

    @Column({ nullable: true })
    code: string;

    @Column({ nullable: true })
    name_th: string;

    @Column({ nullable: true })
    name_en: string;
}

@Entity('districts')
export class District {
    @PrimaryColumn({ type: 'int' })
    id: number;

    @Column({ nullable: true })
    code: string;

    @Column({ nullable: true })
    name_th: string;

    @Column({ nullable: true })
    name_en: string;

    @Column({ name: 'province_id', nullable: true })
    provinceId: number;
}

@Entity('subdistricts')
export class Subdistrict {
    @PrimaryColumn({ type: 'int' })
    id: number;

    @Column({ nullable: true })
    name_th: string;

    @Column({ nullable: true })
    name_en: string;

    @Column({ name: 'district_id', nullable: true })
    districtId: number;

    @Column({ nullable: true })
    zip_code: string;
}
