// Domain Models (matching Prisma schema)

export enum Role {
    ADMIN = 'admin',
    MD = 'md',
    GM = 'gm',
    MANAGER = 'manager',
    ASST_MGR = 'asst_mgr',
    SENIOR_SUP = 'senior_sup',
    SUPERVISOR = 'supervisor',
    SENIOR_STAFF_2 = 'senior_staff_2',
    SENIOR_STAFF_1 = 'senior_staff_1',
    STAFF_2 = 'staff_2',
    STAFF_1 = 'staff_1',
    OP_LEADER = 'op_leader',
    USER = 'staff_1', // Legacy alias
}

export interface User {
    id: string;
    email: string;
    name: string | null;
    password: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}

export interface Post {
    id: string;
    title: string;
    content: string | null;
    published: boolean;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
}
