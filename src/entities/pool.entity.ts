import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('pools')
export class Pool {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ default: 'empty' })
    status: string;

    @Column({ nullable: true, default: '-' })
    grade: string;

    @Column({ name: 'rubber_type', nullable: true, default: '-' })
    rubberType: string;

    @Column({ type: 'float', default: 3000 })
    capacity: number;

    @Column({ name: 'total_weight', type: 'float', default: 0 })
    totalWeight: number;

    @Column({ name: 'total_gross_weight', type: 'float', default: 0 })
    totalGrossWeight: number;

    @Column({ name: 'open_date', nullable: true, type: 'timestamp' })
    openDate: Date;

    @Column({ name: 'close_date', nullable: true, type: 'timestamp' })
    closeDate: Date;

    @Column({ name: 'empty_date', nullable: true, type: 'timestamp' })
    emptyDate: Date;

    @Column({ name: 'filling_date', nullable: true, type: 'timestamp' })
    fillingDate: Date;

    @Column({ name: 'production_plan', nullable: true })
    productionPlan: string;

    @OneToMany('PoolItem', 'pool', { cascade: true })
    items: any[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

@Entity('pool_items')
export class PoolItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'pool_id' })
    poolId: string;

    @ManyToOne(() => Pool, 'items', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'pool_id' })
    pool: Pool;

    @Column({ name: 'booking_id' })
    bookingId: string;

    @Column({ name: 'lot_number' })
    lotNumber: string;

    @Column({ name: 'supplier_name' })
    supplierName: string;

    @Column({ name: 'supplier_code' })
    supplierCode: string;

    @Column({ type: 'timestamp' })
    date: Date;

    @Column({ name: 'net_weight', type: 'float' })
    netWeight: number;

    @Column({ name: 'gross_weight', type: 'float' })
    grossWeight: number;

    @Column()
    grade: string;

    @Column({ name: 'rubber_type' })
    rubberType: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
