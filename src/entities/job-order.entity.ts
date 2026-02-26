import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('job_orders')
export class JobOrder {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'book_no' })
    bookNo: string;

    @Column()
    no: number;

    @Column({ name: 'job_order_no', unique: true })
    jobOrderNo: string;

    @Column({ name: 'contract_no' })
    contractNo: string;

    @Column()
    grade: string;

    @Column({ name: 'other_grade', nullable: true })
    otherGrade: string;

    @Column({ name: 'quantity_bale' })
    quantityBale: number;

    @Column({ name: 'pallet_type' })
    palletType: string;

    @Column({ name: 'order_quantity' })
    orderQuantity: number;

    @Column({ name: 'pallet_marking', default: true })
    palletMarking: boolean;

    @Column({ nullable: true })
    note: string;

    @Column({ name: 'qa_name' })
    qaName: string;

    @Column({ name: 'qa_date', type: 'timestamp' })
    qaDate: Date;

    @Column({ name: 'is_closed', default: false })
    isClosed: boolean;

    @Column({ name: 'production_name', nullable: true })
    productionName: string;

    @Column({ name: 'production_date', nullable: true, type: 'timestamp' })
    productionDate: Date;

    @OneToMany('JobOrderLog', 'jobOrder', { cascade: true })
    logs: any[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

@Entity('job_order_logs')
export class JobOrderLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'job_order_id' })
    jobOrderId: string;

    @ManyToOne(() => JobOrder, 'logs', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'job_order_id' })
    jobOrder: JobOrder;

    @Column({ type: 'timestamp' })
    date: Date;

    @Column()
    shift: string;

    @Column({ name: 'lot_start' })
    lotStart: string;

    @Column({ name: 'lot_end' })
    lotEnd: string;

    @Column()
    quantity: number;

    @Column({ nullable: true })
    sign: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
