import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true, unique: true })
    username: string;

    @Column()
    password: string;

    @Column({ default: 'staff_1' })
    role: string;

    @Column({ name: 'first_name', nullable: true })
    firstName: string;

    @Column({ name: 'last_name', nullable: true })
    lastName: string;

    @Column({ name: 'display_name', nullable: true })
    displayName: string;

    @Column({ nullable: true })
    avatar: string;

    @Column({ type: 'json', nullable: true, default: '[]' })
    permissions: any;

    @Column({ nullable: true })
    department: string;

    @Column({ nullable: true })
    position: string;

    @Column({ default: 'ACTIVE' })
    status: string;

    @Column({ name: 'pin_code', nullable: true })
    pinCode: string;

    @Column({ name: 'employee_id', nullable: true, unique: true })
    employeeId: string;

    @Column({ nullable: true })
    site: string;

    @Column({ name: 'is_hod', default: false })
    isHod: boolean;

    @Column({ name: 'hod_id', nullable: true })
    hodId: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'hod_id' })
    hod: User;

    @Column({ name: 'role_id', nullable: true })
    roleId: string;

    @ManyToOne('Role', { nullable: true, eager: false })
    @JoinColumn({ name: 'role_id' })
    roleRecord: any;

    @ManyToMany('NotificationGroup', 'members')
    notificationGroups: any[];

    @Column({ name: 'force_change_password', default: false })
    forceChangePassword: boolean;

    @Column({ name: 'failed_login_attempts', default: 0 })
    failedLoginAttempts: number;

    @Column({ name: 'last_login_at', nullable: true, type: 'timestamp' })
    lastLoginAt: Date;

    @Column({ type: 'json', nullable: true })
    preferences: any;

    @CreateDateColumn({ name: 'createdAt' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt' })
    updatedAt: Date;
}
