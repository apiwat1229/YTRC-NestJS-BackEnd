import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn
} from 'typeorm';

@Entity('notifications')
@Index(['userId'])
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    message: string;

    @Column({ default: 'INFO' })
    type: string;

    @Column({ default: 'UNREAD' })
    status: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'source_app' })
    sourceApp: string;

    @Column({ name: 'action_type' })
    actionType: string;

    @Column({ name: 'entity_id', nullable: true })
    entityId: string;

    @Column({ name: 'action_url', nullable: true })
    actionUrl: string;

    @Column({ type: 'json', nullable: true })
    metadata: any;

    @Column({ name: 'approval_request_id', nullable: true })
    approvalRequestId: string;

    @Column({ name: 'approval_status', nullable: true })
    approvalStatus: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
