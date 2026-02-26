import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('rubber_types')
@Index(['deletedAt'])
export class RubberType {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    code: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    category: string;

    @Column({ name: 'is_active', default: true })
    is_active: boolean;

    @Column({ name: 'deleted_at', nullable: true, type: 'timestamp' })
    deletedAt: Date;

    @Column({ name: 'deleted_by', nullable: true })
    deletedBy: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
