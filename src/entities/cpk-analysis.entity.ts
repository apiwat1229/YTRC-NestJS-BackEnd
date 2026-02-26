import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('cpk_analyses')
export class CpkAnalysis {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'float', nullable: true })
    lsl: number;

    @Column({ type: 'float', nullable: true })
    usl: number;

    @Column({ type: 'int', default: 5 })
    subgroupSize: number;

    @Column({ type: 'json', nullable: true })
    dataPoints: number[];

    @Column({ type: 'text', nullable: true })
    note: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
