import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('machines')
export class Machine {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    model: string;

    @Column({ nullable: true })
    location: string;

    @Column({ default: 'Active' })
    status: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => RepairLog, log => log.machine)
    repairs: RepairLog[];
}

@Entity('repair_logs')
export class RepairLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'machine_id' })
    machineId: string;

    @Column({ name: 'machine_name' })
    machineName: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    date: Date;

    @Column()
    issue: string;

    @Column()
    technician: string;

    @Column({ type: 'json', nullable: true, default: '[]' })
    parts: any;

    @Column({ name: 'total_cost', type: 'float', default: 0 })
    totalCost: number;

    @Column({ default: 'COMPLETED' })
    status: string;

    @Column({ type: 'simple-array', default: '' })
    images: string[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Machine, machine => machine.repairs)
    @JoinColumn({ name: 'machine_id' })
    machine: Machine;
}

@Entity('maintenance_stocks')
export class MaintenanceStock {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true, unique: true })
    code: string;

    @Column()
    name: string;

    @Column({ name: 'name_th', nullable: true })
    nameTH: string;

    @Column({ name: 'name_en', nullable: true })
    nameEN: string;

    @Column({ nullable: true })
    category: string;

    @Column({ nullable: true })
    location: string;

    @Column({ name: 'gl_code', nullable: true })
    glCode: string;

    @Column({ default: 0 })
    qty: number;

    @Column({ type: 'float', default: 0 })
    price: number;

    @Column()
    unit: string;

    @Column({ name: 'min_qty', default: 0 })
    minQty: number;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    image: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

@Entity('gl_codes')
export class GLCode {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'transaction_id' })
    transactionId: string;

    @Column()
    description: string;

    @Column()
    code: string;

    @Column({ nullable: true })
    purpose: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

@Entity('stock_categories')
export class StockCategory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ name: 'name_en', nullable: true })
    nameEN: string;

    @Column({ name: 'name_th', nullable: true })
    nameTH: string;

    @Column({ nullable: true })
    prefix: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

@Entity('storage_locations')
export class StorageLocation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ name: 'name_en', nullable: true })
    nameEN: string;

    @Column({ name: 'name_th', nullable: true })
    nameTH: string;

    @Column({ nullable: true })
    building: string;

    @Column({ nullable: true })
    zone: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
