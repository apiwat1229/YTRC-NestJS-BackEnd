import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('it_assets')
export class ITAsset {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    code: string;

    @Column()
    name: string;

    @Column()
    category: string;

    @Column({ default: 0 })
    stock: number;

    @Column({ name: 'min_stock', default: 2 })
    minStock: number;

    @Column({ nullable: true })
    location: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    image: string;

    @Column({ type: 'float', nullable: true, default: 0 })
    price: number;

    @Column({ name: 'received_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    receivedDate: Date;

    @Column({ nullable: true })
    receiver: string;

    @Column({ name: 'serial_number', nullable: true })
    serialNumber: string;

    @Column({ nullable: true })
    barcode: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
