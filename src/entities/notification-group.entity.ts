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

@Entity('notification_groups')
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

    @Column({ default: true })
    isActive: boolean;

    @ManyToMany(() => User, 'notificationGroups')
    @JoinTable({
        name: 'notification_group_members',
        joinColumn: { name: 'notification_group_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    members: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
