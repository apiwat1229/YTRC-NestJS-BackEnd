import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('NotificationGroup')
export class NotificationGroup {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    icon: string;

    @Column({ nullable: true })
    color: string;

    @Column({ name: 'isActive', default: true })
    isActive: boolean;

    @ManyToMany(() => User, 'notificationGroups')
    @JoinTable({
        name: '_NotificationGroupMembers',
        joinColumn: { name: 'A', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'B', referencedColumnName: 'id' },
    })
    members: User[];

    @CreateDateColumn({ name: 'createdAt' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt' })
    updatedAt: Date;
}
