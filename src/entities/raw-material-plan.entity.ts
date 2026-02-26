import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('raw_material_plans')
export class RawMaterialPlan {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'plan_no', unique: true })
    planNo: string;

    @Column({ name: 'revision_no' })
    revisionNo: string;

    @Column({ name: 'ref_production_no' })
    refProductionNo: string;

    @Column({ name: 'issued_date', type: 'timestamp' })
    issuedDate: Date;

    @Column()
    creator: string;

    @Column({ nullable: true })
    checker: string;

    @Column({ default: 'DRAFT' })
    status: string;

    @OneToMany('RawMaterialPlanRow', 'plan', { cascade: true })
    rows: any[];

    @OneToMany('RawMaterialPlanPoolDetail', 'plan', { cascade: true })
    poolDetails: any[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

@Entity('raw_material_plan_rows')
export class RawMaterialPlanRow {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'plan_id' })
    planId: string;

    @ManyToOne(() => RawMaterialPlan, 'rows', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'plan_id' })
    plan: RawMaterialPlan;

    @Column({ type: 'timestamp' })
    date: Date;

    @Column({ name: 'day_of_week' })
    dayOfWeek: string;

    @Column()
    shift: string;

    @Column({ nullable: true })
    grade: string;

    @Column({ name: 'ratio_uss', type: 'float', nullable: true })
    ratioUSS: number;

    @Column({ name: 'ratio_cl', type: 'float', nullable: true })
    ratioCL: number;

    @Column({ name: 'ratio_bk', type: 'float', nullable: true })
    ratioBK: number;

    @Column({ name: 'product_target', type: 'float', nullable: true })
    productTarget: number;

    @Column({ name: 'cl_consumption', type: 'float', nullable: true })
    clConsumption: number;

    @Column({ name: 'ratio_b_or_c', type: 'float', nullable: true })
    ratioBorC: number;

    @Column({ name: 'plan1_pool', nullable: true })
    plan1Pool: string;

    @Column({ name: 'plan1_note', nullable: true })
    plan1Note: string;

    @Column({ name: 'plan2_pool', nullable: true })
    plan2Pool: string;

    @Column({ name: 'plan2_note', nullable: true })
    plan2Note: string;

    @Column({ name: 'plan3_pool', nullable: true })
    plan3Pool: string;

    @Column({ name: 'plan3_note', nullable: true })
    plan3Note: string;

    @Column({ name: 'cutting_percent', type: 'float', nullable: true })
    cuttingPercent: number;

    @Column({ name: 'cutting_palette', nullable: true })
    cuttingPalette: number;

    @Column({ nullable: true })
    remarks: string;

    @Column({ name: 'special_indicator', nullable: true })
    specialIndicator: string;
}

@Entity('raw_material_plan_pool_details')
export class RawMaterialPlanPoolDetail {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'plan_id' })
    planId: string;

    @ManyToOne(() => RawMaterialPlan, 'poolDetails', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'plan_id' })
    plan: RawMaterialPlan;

    @Column({ name: 'pool_no' })
    poolNo: string;

    @Column({ name: 'gross_weight', type: 'float', nullable: true })
    grossWeight: number;

    @Column({ name: 'net_weight', type: 'float', nullable: true })
    netWeight: number;

    @Column({ type: 'float', nullable: true })
    drc: number;

    @Column({ type: 'float', nullable: true })
    moisture: number;

    @Column({ name: 'p0', type: 'float', nullable: true })
    p0: number;

    @Column({ type: 'float', nullable: true })
    pri: number;

    @Column({ name: 'clear_date', nullable: true, type: 'timestamp' })
    clearDate: Date;

    @Column({ nullable: true })
    grade: string;

    @Column({ nullable: true })
    remark: string;
}
