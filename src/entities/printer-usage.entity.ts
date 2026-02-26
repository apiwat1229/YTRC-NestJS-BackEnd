import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity('printer_departments')
export class PrinterDepartment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    description: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

@Entity('printer_user_mappings')
export class PrinterUserMapping {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_name', unique: true })
    userName: string;

    @Column({ name: 'department_id' })
    departmentId: string;

    @ManyToOne(() => PrinterDepartment, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'department_id' })
    department: PrinterDepartment;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

@Entity('printer_usage_records')
@Unique(['period', 'userName', 'serialNo'])
export class PrinterUsageRecord {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'timestamp' })
    period: Date;

    @Column({ name: 'user_name' })
    userName: string;

    @Column({ name: 'department_id', nullable: true })
    departmentId: string;

    @ManyToOne(() => PrinterDepartment, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'department_id' })
    department: PrinterDepartment;

    @Column({ name: 'serial_no', default: 'unknown' })
    serialNo: string;

    @Column({ name: 'print_bw', default: 0 })
    printBW: number;

    @Column({ name: 'print_color', default: 0 })
    printColor: number;

    @Column({ name: 'copy_bw', default: 0 })
    copyBW: number;

    @Column({ name: 'copy_color', default: 0 })
    copyColor: number;

    @Column({ default: 0 })
    total: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
