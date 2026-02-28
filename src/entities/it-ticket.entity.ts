import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity('it_tickets')
export class ITTicket {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'ticket_no', unique: true })
    ticketNo: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ default: 'OPEN' })
    status: string;

    @Column({ default: 'MEDIUM' })
    priority: string;

    @Column({ nullable: true })
    category: string;

    @Column({ name: 'requester_id' })
    requesterId: string;

    @Column({ name: 'assignee_id', nullable: true })
    assigneeId: string;

    @Column({ name: 'asset_id', nullable: true })
    assetId: string;

    @Column({ nullable: true })
    location: string;

    @Column({ name: 'approver_id', nullable: true })
    approverId: string;

    @Column({ name: 'expected_date', nullable: true, type: 'timestamp' })
    expectedDate: Date;

    @Column({ name: 'is_asset_request', default: false })
    isAssetRequest: boolean;

    @Column({ name: 'issued_at', nullable: true, type: 'timestamp' })
    issuedAt: Date;

    @Column({ name: 'issued_by', nullable: true })
    issuedBy: string;

    @Column({ nullable: true, type: 'int' })
    quantity: number;

    @Column({ name: 'resolved_at', nullable: true, type: 'timestamp' })
    resolvedAt: Date;

    @Column({ nullable: true, type: 'text' })
    feedback: string;

    @Column({ nullable: true, type: 'int' })
    rating: number;

    @OneToMany('TicketComment', 'ticket', { cascade: true })
    comments: any[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

@Entity('ticket_comments')
export class TicketComment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'ticket_id' })
    ticketId: string;

    @ManyToOne(() => ITTicket, 'comments', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ticket_id' })
    ticket: ITTicket;

    @Column({ name: 'user_id' })
    authorId: string;

    @Column({ type: 'text' })
    content: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
