import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('suppliers')
@Index(['deletedAt'])
export class Supplier {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    code: string;

    @Column({ name: 'display_name' })
    name: string;

    @Column({ name: 'tax_id', nullable: true })
    taxId: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ name: 'province_id', nullable: true })
    provinceId: number;

    @Column({ name: 'district_id', nullable: true })
    districtId: number;

    @Column({ name: 'subdistrict_id', nullable: true })
    subdistrictId: number;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ default: 'ACTIVE' })
    status: string;

    @Column({ nullable: true })
    notes: string;

    @Column({ name: 'rubber_type_codes', type: 'simple-array', default: '' })
    rubberTypeCodes: string[];

    @Column({ name: 'first_name', nullable: true })
    firstName: string;

    @Column({ name: 'last_name', nullable: true })
    lastName: string;

    @Column({ nullable: true })
    title: string;

    @Column({ nullable: true })
    avatar: string;

    @Column({ name: 'zip_code', nullable: true })
    zipCode: string;

    @Column({ name: 'contact_person', nullable: true })
    contactPerson: string;

    @Column({ name: 'certificate_number', nullable: true })
    certificateNumber: string;

    @Column({ name: 'certificate_expire', nullable: true, type: 'timestamp' })
    certificateExpire: Date;

    @Column({ type: 'float', nullable: true, default: 0 })
    score: number;

    @Column({ name: 'eudr_quota_used', type: 'float', nullable: true })
    eudrQuotaUsed: number;

    @Column({ name: 'eudr_quota_current', type: 'float', nullable: true })
    eudrQuotaCurrent: number;

    @Column({ name: 'deleted_at', nullable: true, type: 'timestamp' })
    deletedAt: Date;

    @Column({ name: 'deleted_by', nullable: true })
    deletedBy: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
