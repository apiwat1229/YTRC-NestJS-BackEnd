import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('production_reports')
export class ProductionReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'dryer_name' })
    dryerName: string;

    @Column({ name: 'book_no' })
    bookNo: string;

    @Column({ name: 'page_no' })
    pageNo: string;

    @Column({ name: 'production_date', type: 'timestamp' })
    productionDate: Date;

    @Column()
    shift: string;

    @Column()
    grade: string;

    @Column({ name: 'ratio_cl', type: 'float', nullable: true })
    ratioCL: number;

    @Column({ name: 'ratio_uss', type: 'float', nullable: true })
    ratioUSS: number;

    @Column({ name: 'ratio_cutting', type: 'float', nullable: true })
    ratioCutting: number;

    @Column({ name: 'weight_pallet_remained', type: 'float', nullable: true })
    weightPalletRemained: number;

    @Column({ name: 'sample_accum_1', nullable: true })
    sampleAccum1: number;

    @Column({ name: 'sample_accum_2', nullable: true })
    sampleAccum2: number;

    @Column({ name: 'sample_accum_3', nullable: true })
    sampleAccum3: number;

    @Column({ name: 'sample_accum_4', nullable: true })
    sampleAccum4: number;

    @Column({ name: 'sample_accum_5', nullable: true })
    sampleAccum5: number;

    @OneToMany('ProductionReportRow', 'report', { cascade: true })
    rows: any[];

    @Column({ name: 'bale_bag_lot_no', nullable: true })
    baleBagLotNo: string;

    @Column({ name: 'checked_by', nullable: true })
    checkedBy: string;

    @Column({ name: 'judged_by', nullable: true })
    judgedBy: string;

    @Column({ name: 'issued_by', nullable: true })
    issuedBy: string;

    @Column({ name: 'issued_at', nullable: true, type: 'timestamp' })
    issuedAt: Date;

    @Column({ default: 'DRAFT' })
    status: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

@Entity('production_report_rows')
export class ProductionReportRow {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'report_id' })
    reportId: string;

    @ManyToOne(() => ProductionReport, 'rows', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'report_id' })
    report: ProductionReport;

    @Column({ name: 'start_time' })
    startTime: string;

    @Column({ name: 'pallet_type' })
    palletType: string;

    @Column({ name: 'lot_no' })
    lotNo: string;

    @Column({ name: 'weight_1', type: 'float', nullable: true })
    weight1: number;

    @Column({ name: 'weight_2', type: 'float', nullable: true })
    weight2: number;

    @Column({ name: 'weight_3', type: 'float', nullable: true })
    weight3: number;

    @Column({ name: 'weight_4', type: 'float', nullable: true })
    weight4: number;

    @Column({ name: 'weight_5', type: 'float', nullable: true })
    weight5: number;

    @Column({ name: 'sample_count', nullable: true })
    sampleCount: number;
}



