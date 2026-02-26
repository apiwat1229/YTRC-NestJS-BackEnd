import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from 'typeorm';
import { User } from './user.entity';

@Entity('approval_requests')
@Index(['status'])
@Index(['requesterId'])
export class ApprovalRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'request_type' })
    requestType: string;

    @Column({ name: 'entity_type' })
    entityType: string;

    @Column({ name: 'entity_id' })
    entityId: string;

    @Column({ name: 'source_app' })
    sourceApp: string;

    @Column({ name: 'action_type' })
    actionType: string;

    @Column({ name: 'current_data', type: 'json', nullable: true })
    currentData: any;

    @Column({ name: 'proposed_data', type: 'json', nullable: true })
    proposedData: any;

    @Column({ nullable: true })
    reason: string;

    @Column({ default: 'NORMAL' })
    priority: string;

    @Column({ default: 'PENDING' })
    status: string;

    @Column({ name: 'requester_id' })
    requesterId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'requester_id' })
    requester: User;

    @Column({ name: 'approver_id', nullable: true })
    approverId: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'approver_id' })
    approver: User;

    @CreateDateColumn({ name: 'submitted_at' })
    submittedAt: Date;

    @Column({ name: 'acted_at', nullable: true, type: 'timestamp' })
    actedAt: Date;

    @Column({ name: 'expires_at', nullable: true, type: 'timestamp' })
    expiresAt: Date;

    @Column({ nullable: true })
    remark: string;

    @Column({ name: 'deleted_at', nullable: true, type: 'timestamp' })
    deletedAt: Date;

    @Column({ name: 'deleted_by', nullable: true })
    deletedBy: string;

    @OneToMany(() => ApprovalLog, log => log.approvalRequest)
    logs: ApprovalLog[];
}

@Entity('approval_logs')
export class ApprovalLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'approval_request_id' })
    approvalRequestId: string;

    @ManyToOne(() => ApprovalRequest)
    @JoinColumn({ name: 'approval_request_id' })
    approvalRequest: ApprovalRequest;

    @Column()
    action: string;

    @Column({ name: 'old_value', type: 'json', nullable: true })
    oldValue: any;

    @Column({ name: 'new_value', type: 'json', nullable: true })
    newValue: any;

    @Column({ name: 'actor_id' })
    actorId: string;

    @Column({ name: 'actor_name' })
    actorName: string;

    @Column({ name: 'actor_role' })
    actorRole: string;

    @Column({ nullable: true })
    remark: string;

    @Column({ name: 'ip_address', nullable: true })
    ipAddress: string;

    @Column({ name: 'user_agent', nullable: true })
    userAgent: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
