import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('bookings')
@Index(['bookingCode'])
@Index(['deletedAt'])
export class Booking {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'queue_no' })
    queueNo: number;

    @Column({ name: 'booking_code', unique: true })
    bookingCode: string;

    @Column({ type: 'timestamp' })
    date: Date;

    @Column({ name: 'start_time' })
    startTime: string;

    @Column({ name: 'end_time' })
    endTime: string;

    @Column({ nullable: true })
    slot: string;

    @Column({ name: 'supplier_id' })
    supplierId: string;

    @Column({ name: 'supplier_code' })
    supplierCode: string;

    @Column({ name: 'supplier_name' })
    supplierName: string;

    @Column({ name: 'truck_type', nullable: true })
    truckType: string;

    @Column({ name: 'truck_register', nullable: true })
    truckRegister: string;

    @Column({ name: 'rubber_type' })
    rubberType: string;

    @Column({ name: 'lot_no', nullable: true })
    lotNo: string;

    @Column({ name: 'estimated_weight', type: 'float', nullable: true })
    estimatedWeight: number;

    @Column({ type: 'float', nullable: true })
    moisture: number;

    @Column({ name: 'drc_est', type: 'float', nullable: true })
    drcEst: number;

    @Column({ name: 'drc_requested', type: 'float', nullable: true })
    drcRequested: number;

    @Column({ name: 'drc_actual', type: 'float', nullable: true })
    drcActual: number;

    @Column({ name: 'cp_avg', type: 'float', nullable: true })
    cpAvg: number;

    @Column({ nullable: true })
    grade: string;

    @Column()
    recorder: string;

    @Column({ nullable: true })
    note: string;

    @Column({ default: 'PENDING' })
    status: string;

    @Column({ name: 'approved_by', nullable: true })
    approvedBy: string;

    @Column({ name: 'approved_at', nullable: true, type: 'timestamp' })
    approvedAt: Date;

    @Column({ name: 'checkin_at', nullable: true, type: 'timestamp' })
    checkinAt: Date;

    @Column({ name: 'checked_in_by', nullable: true })
    checkedInBy: string;

    @Column({ name: 'start_drain_at', nullable: true, type: 'timestamp' })
    startDrainAt: Date;

    @Column({ name: 'start_drain_by', nullable: true })
    startDrainBy: string;

    @Column({ name: 'stop_drain_at', nullable: true, type: 'timestamp' })
    stopDrainAt: Date;

    @Column({ name: 'stop_drain_by', nullable: true })
    stopDrainBy: string;

    @Column({ name: 'drain_note', nullable: true })
    drainNote: string;

    @Column({ name: 'weight_in', type: 'float', nullable: true })
    weightIn: number;

    @Column({ name: 'weight_in_by', nullable: true })
    weightInBy: string;

    @Column({ name: 'weight_out', type: 'float', nullable: true })
    weightOut: number;

    @Column({ name: 'weight_out_by', nullable: true })
    weightOutBy: string;

    @Column({ name: 'rubber_source', nullable: true })
    rubberSource: string;

    @Column({ name: 'trailer_weight_in', type: 'float', nullable: true })
    trailerWeightIn: number;

    @Column({ name: 'trailer_weight_out', type: 'float', nullable: true })
    trailerWeightOut: number;

    @Column({ name: 'trailer_rubber_type', nullable: true })
    trailerRubberType: string;

    @Column({ name: 'trailer_rubber_source', nullable: true })
    trailerRubberSource: string;

    @Column({ name: 'trailer_lot_no', nullable: true })
    trailerLotNo: string;

    @Column({ name: 'trailer_moisture', type: 'float', nullable: true })
    trailerMoisture: number;

    @Column({ name: 'trailer_drc_est', type: 'float', nullable: true })
    trailerDrcEst: number;

    @Column({ name: 'trailer_drc_requested', type: 'float', nullable: true })
    trailerDrcRequested: number;

    @Column({ name: 'trailer_drc_actual', type: 'float', nullable: true })
    trailerDrcActual: number;

    @Column({ name: 'trailer_cp_avg', type: 'float', nullable: true })
    trailerCpAvg: number;

    @Column({ name: 'trailer_grade', nullable: true })
    trailerGrade: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany('BookingLabSample', 'booking', { cascade: true })
    labSamples: any[];

    @Column({ name: 'deleted_at', nullable: true, type: 'timestamp' })
    deletedAt: Date;

    @Column({ name: 'deleted_by', nullable: true })
    deletedBy: string;
}

@Entity('booking_lab_samples')
export class BookingLabSample {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'booking_id' })
    bookingId: string;

    @ManyToOne(() => Booking, 'labSamples', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;

    @Column({ name: 'sample_no' })
    sampleNo: number;

    @Column({ name: 'is_trailer', default: false })
    isTrailer: boolean;

    @Column({ name: 'before_press', type: 'float', nullable: true })
    beforePress: number;

    @Column({ name: 'basket_weight', type: 'float', nullable: true })
    basketWeight: number;

    @Column({ name: 'cuplump_weight', type: 'float', nullable: true })
    cuplumpWeight: number;

    @Column({ name: 'after_press', type: 'float', nullable: true })
    afterPress: number;

    @Column({ name: 'percent_cp', type: 'float', nullable: true })
    percentCp: number;

    @Column({ name: 'before_baking_1', type: 'float', nullable: true })
    beforeBaking1: number;

    @Column({ name: 'after_dryer_b1', type: 'float', nullable: true })
    afterDryerB1: number;

    @Column({ name: 'before_lab_dryer_b1', type: 'float', nullable: true })
    beforeLabDryerB1: number;

    @Column({ name: 'after_lab_dryer_b1', type: 'float', nullable: true })
    afterLabDryerB1: number;

    @Column({ name: 'drc_b1', type: 'float', nullable: true })
    drcB1: number;

    @Column({ name: 'moisture_percent_b1', type: 'float', nullable: true })
    moisturePercentB1: number;

    @Column({ name: 'drc_dry_b1', type: 'float', nullable: true })
    drcDryB1: number;

    @Column({ name: 'lab_drc_b1', type: 'float', nullable: true })
    labDrcB1: number;

    @Column({ name: 'recal_drc_b1', type: 'float', nullable: true })
    recalDrcB1: number;

    @Column({ name: 'before_baking_2', type: 'float', nullable: true })
    beforeBaking2: number;

    @Column({ name: 'after_dryer_b2', type: 'float', nullable: true })
    afterDryerB2: number;

    @Column({ name: 'before_lab_dryer_b2', type: 'float', nullable: true })
    beforeLabDryerB2: number;

    @Column({ name: 'after_lab_dryer_b2', type: 'float', nullable: true })
    afterLabDryerB2: number;

    @Column({ name: 'drc_b2', type: 'float', nullable: true })
    drcB2: number;

    @Column({ name: 'moisture_percent_b2', type: 'float', nullable: true })
    moisturePercentB2: number;

    @Column({ name: 'drc_dry_b2', type: 'float', nullable: true })
    drcDryB2: number;

    @Column({ name: 'lab_drc_b2', type: 'float', nullable: true })
    labDrcB2: number;

    @Column({ name: 'recal_drc_b2', type: 'float', nullable: true })
    recalDrcB2: number;

    @Column({ name: 'before_baking_3', type: 'float', nullable: true })
    beforeBaking3: number;

    @Column({ name: 'after_dryer_b3', type: 'float', nullable: true })
    afterDryerB3: number;

    @Column({ name: 'before_lab_dryer_b3', type: 'float', nullable: true })
    beforeLabDryerB3: number;

    @Column({ name: 'after_lab_dryer_b3', type: 'float', nullable: true })
    afterLabDryerB3: number;

    @Column({ name: 'drc_b3', type: 'float', nullable: true })
    drcB3: number;

    @Column({ name: 'moisture_percent_b3', type: 'float', nullable: true })
    moisturePercentB3: number;

    @Column({ name: 'drc_dry_b3', type: 'float', nullable: true })
    drcDryB3: number;

    @Column({ name: 'lab_drc_b3', type: 'float', nullable: true })
    labDrcB3: number;

    @Column({ name: 'recal_drc_b3', type: 'float', nullable: true })
    recalDrcB3: number;

    @Column({ type: 'float', nullable: true })
    drc: number;

    @Column({ name: 'moisture_factor', type: 'float', nullable: true })
    moistureFactor: number;

    @Column({ name: 'recal_drc', type: 'float', nullable: true })
    recalDrc: number;

    @Column({ type: 'float', nullable: true })
    difference: number;

    @Column({ name: 'p0', type: 'float', nullable: true })
    p0: number;

    @Column({ name: 'p30', type: 'float', nullable: true })
    p30: number;

    @Column({ type: 'float', nullable: true })
    pri: number;

    @Column({ nullable: true })
    storage: string;

    @Column({ name: 'recorded_by', nullable: true })
    recordedBy: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
