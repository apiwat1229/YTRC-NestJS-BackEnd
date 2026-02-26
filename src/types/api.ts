// API Request/Response Types
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsDateString, IsEmail, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Auth DTOs
export interface LoginDto {
    email?: string;
    username?: string;
    password: string;
}

export interface RegisterDto {
    email: string;
    password: string;
    username?: string;
    firstName?: string;
    lastName?: string;
}

export interface AuthResponse {
    accessToken: string;
    user: UserDto;
}

// User DTOs
export type UserRole =
    | 'admin'
    | 'md'
    | 'gm'
    | 'manager'
    | 'asst_mgr'
    | 'senior_sup'
    | 'supervisor'
    | 'senior_staff_2'
    | 'senior_staff_1'
    | 'staff_2'
    | 'staff_1'
    | 'op_leader'
    // Preserving existing roles for backward compatibility during migration
    | 'USER'
    | 'ADMIN';

export interface UserDto {
    id: string;
    email: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    displayName: string | null;
    department: string | null;
    position: string | null;
    role: UserRole;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    pinCode: string | null;
    hodId: string | null;
    avatar: string | null;
    createdAt: string;
    updatedAt: string;
}

export class CreateUserDto {
    @IsEmail()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;

    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    displayName?: string;

    @IsOptional()
    @IsString()
    department?: string;

    @IsOptional()
    @IsString()
    position?: string;

    @IsOptional()
    @IsString()
    role?: UserRole;

    @IsOptional()
    @IsString()
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

    @IsOptional()
    @IsString()
    employeeId?: string;

    @IsOptional()
    @IsString()
    pinCode?: string;

    @IsOptional()
    @IsString()
    hodId?: string;

    @IsOptional()
    @IsString()
    avatar?: string;

    @IsOptional()
    @IsString()
    roleId?: string;

    @IsOptional()
    @IsBoolean()
    forceChangePassword?: boolean;
}

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    displayName?: string;

    @IsOptional()
    @IsString()
    department?: string;

    @IsOptional()
    @IsString()
    position?: string;

    @IsOptional()
    @IsString()
    role?: UserRole;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    pinCode?: string;

    @IsOptional()
    @IsString()
    employeeId?: string;

    @IsOptional()
    @IsString()
    hodId?: string;

    @IsOptional()
    @IsString()
    avatar?: string;

    @IsOptional()
    @IsBoolean()
    forceChangePassword?: boolean;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    lastLoginAt?: Date;

    @IsOptional()
    preferences?: any;

    @IsOptional()
    @IsString()
    roleId?: string;
}

export class CreateSupplierDto {
    @IsString()
    @IsNotEmpty()
    code!: string;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    taxId?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsNumber()
    provinceId?: number;

    @IsOptional()
    @IsNumber()
    districtId?: number;

    @IsOptional()
    @IsNumber()
    subdistrictId?: number;

    @IsOptional()
    @IsString()
    zipCode?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    avatar?: string;

    @IsOptional()
    @IsString()
    certificateNumber?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    certificateExpire?: Date;

    @IsOptional()
    @IsNumber()
    score?: number;

    @IsOptional()
    @IsNumber()
    eudrQuotaUsed?: number;

    @IsOptional()
    @IsNumber()
    eudrQuotaCurrent?: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    rubberTypeCodes?: string[];

    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateSupplierDto {
    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    taxId?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsNumber()
    provinceId?: number;

    @IsOptional()
    @IsNumber()
    districtId?: number;

    @IsOptional()
    @IsNumber()
    subdistrictId?: number;

    @IsOptional()
    @IsString()
    zipCode?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    avatar?: string;

    @IsOptional()
    @IsString()
    certificateNumber?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    certificateExpire?: Date;

    @IsOptional()
    @IsNumber()
    score?: number;

    @IsOptional()
    @IsNumber()
    eudrQuotaUsed?: number;

    @IsOptional()
    @IsNumber()
    eudrQuotaCurrent?: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    rubberTypeCodes?: string[];

    @IsOptional()
    @IsString()
    notes?: string;
}

// Post DTOs
export interface PostDto {
    id: string;
    title: string;
    content: string | null;
    published: boolean;
    authorId: string;
    author?: UserDto;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePostDto {
    title: string;
    content?: string;
    published?: boolean;
    authorId?: string; // Optional if inferred from auth
}

export interface UpdatePostDto {
    title?: string;
    content?: string;
    published?: boolean;
}

// Role DTOs
export interface RoleDto {
    id: string;
    name: string;
    description: string | null;
    permissions: Record<string, any>;
    icon?: string;
    color?: string;
    usersCount?: number;
    isSystem?: boolean; // To protect system roles
    createdAt: string;
    updatedAt: string;
}

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    permissions?: Record<string, any>;

    @IsOptional()
    @IsString()
    icon?: string;

    @IsOptional()
    @IsString()
    color?: string;
}

export class UpdateRoleDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    permissions?: Record<string, any>;

    @IsOptional()
    @IsString()
    icon?: string;

    @IsOptional()
    @IsString()
    color?: string;
}

// ==================== Notification DTOs ====================

export interface NotificationDto {
    id: string;
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'REQUEST' | 'APPROVE';
    isRead: boolean;
    userId: string;
    createdAt: Date;
    readAt?: Date;
    actionUrl?: string;
}

export interface BroadcastDto {
    id: string;
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'REQUEST' | 'APPROVE';
    senderId: string;
    recipientRoles?: string[];
    recipientUsers?: string[];
    recipientGroups?: string[];
    createdAt: Date;
}

export class CreateBroadcastDto {
    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsString()
    @IsNotEmpty()
    message!: string;

    @IsOptional()
    @IsIn(['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'REQUEST', 'APPROVE'])
    type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'REQUEST' | 'APPROVE';

    @IsOptional()
    @IsArray()
    recipientRoles?: string[];

    @IsOptional()
    @IsArray()
    recipientUsers?: string[];

    @IsOptional()
    @IsArray()
    recipientGroups?: string[];

    @IsOptional()
    @IsString()
    actionUrl?: string;
}

export interface NotificationGroupDto {
    id: string;
    name: string;
    description?: string;
    memberIds: string[];
    icon?: string;
    color?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class CreateNotificationGroupDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsArray()
    memberIds?: string[];

    @IsOptional()
    @IsString()
    icon?: string;
}

export class UpdateNotificationSettingDto {
    @IsOptional()
    @IsString()
    sourceApp?: string;

    @IsOptional()
    @IsString()
    actionType?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsArray()
    recipientRoles?: string[];

    @IsOptional()
    @IsArray()
    recipientGroups?: string[];

    @IsOptional()
    @IsArray()
    recipientUsers?: string[];

    @IsOptional()
    @IsArray()
    channels?: string[];
}

// ==================== Printer Usage DTOs ====================

export interface PrinterDepartmentDto {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export class CreatePrinterDepartmentDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;
}

export class UpdatePrinterDepartmentDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;
}

export interface PrinterUserMappingDto {
    id: string;
    userName: string;
    departmentId: string;
    department?: PrinterDepartmentDto;
    createdAt: Date;
    updatedAt: Date;
}

export class UpsertPrinterUserMappingDto {
    @IsString()
    @IsNotEmpty()
    userName!: string;

    @IsString()
    @IsNotEmpty()
    departmentId!: string;
}


export class SavePrinterUsageRecordDto {
    @IsDate()
    @Type(() => Date)
    period!: Date;

    @IsString()
    @IsNotEmpty()
    userName!: string;

    @IsString()
    @IsOptional()
    serialNo?: string;

    @IsNumber()
    printBW!: number;

    @IsNumber()
    printColor!: number;

    @IsNumber()
    copyBW!: number;

    @IsNumber()
    copyColor!: number;

    @IsNumber()
    total!: number;
}

// ==================== IT Asset DTOs ====================

export class CreateITAssetDto {
    @IsString()
    @IsNotEmpty()
    code!: string;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    category!: string;

    @IsNumber()
    stock!: number;

    @IsNumber()
    @IsOptional()
    minStock?: number;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    image?: string;

    @IsNumber()
    @IsOptional()
    price?: number;

    @IsDateString()
    @IsOptional()
    // @Type(() => Date) - Removing Type transformer to keep it as string for validation, or let backend define it. 
    // Actually, if we use IsDateString, we can keep it as string in DTO or use Type to convert.
    // Ideally for API DTO: Input is string (JSON). 
    receivedDate?: Date | string;

    @IsString()
    @IsOptional()
    receiver?: string;

    @IsString()
    @IsOptional()
    serialNumber?: string;

    @IsString()
    @IsOptional()
    barcode?: string;
}

export class UpdateITAssetDto {
    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    serialNumber?: string;

    @IsOptional()
    @IsString()
    barcode?: string;

    @IsOptional()
    @IsNumber()
    stock?: number;

    @IsOptional()
    @IsNumber()
    minStock?: number;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsNumber()
    price?: number;

    @IsOptional()
    @IsDateString()
    receivedDate?: Date | string;

    @IsOptional()
    @IsString()
    receiver?: string;
}

// ==================== Job Order DTOs ====================

export class JobOrderLogDto {
    @IsDateString()
    date!: string;

    @IsString()
    @IsNotEmpty()
    shift!: string;

    @IsString()
    @IsNotEmpty()
    lotStart!: string;

    @IsString()
    @IsNotEmpty()
    lotEnd!: string;

    @IsNumber()
    quantity!: number;

    @IsOptional()
    @IsString()
    sign?: string;
}

export class CreateJobOrderDto {
    @IsOptional()
    @IsString()
    bookNo?: string;

    @IsOptional()
    @IsNumber()
    no?: number;

    @IsString()
    @IsNotEmpty()
    jobOrderNo!: string;

    @IsString()
    @IsNotEmpty()
    contractNo!: string;

    @IsString()
    @IsNotEmpty()
    grade!: string;

    @IsOptional()
    @IsString()
    otherGrade?: string;

    @IsNumber()
    @IsIn([35, 36])
    quantityBale!: number;

    @IsString()
    @IsNotEmpty()
    palletType!: string;

    @IsNumber()
    orderQuantity!: number;

    @IsBoolean()
    palletMarking!: boolean;

    @IsOptional()
    @IsString()
    note?: string;

    @IsString()
    @IsNotEmpty()
    qaName!: string;

    @IsDateString()
    qaDate!: string;

    @IsOptional()
    @IsBoolean()
    isClosed?: boolean;

    @IsOptional()
    @IsArray()
    @Type(() => JobOrderLogDto)
    logs?: JobOrderLogDto[];
}

export class UpdateJobOrderDto {
    @IsOptional()
    @IsString()
    bookNo?: string;

    @IsOptional()
    @IsNumber()
    no?: number;

    @IsOptional()
    @IsString()
    jobOrderNo?: string;

    @IsOptional()
    @IsString()
    contractNo?: string;

    @IsOptional()
    @IsString()
    grade?: string;

    @IsOptional()
    @IsString()
    otherGrade?: string;

    @IsOptional()
    @IsNumber()
    quantityBale?: number;

    @IsOptional()
    @IsString()
    palletType?: string;

    @IsOptional()
    @IsNumber()
    orderQuantity?: number;

    @IsOptional()
    @IsBoolean()
    palletMarking?: boolean;

    @IsOptional()
    @IsString()
    note?: string;

    @IsOptional()
    @IsString()
    qaName?: string;

    @IsOptional()
    @IsDateString()
    qaDate?: string;

    @IsOptional()
    @IsBoolean()
    isClosed?: boolean;

    @IsOptional()
    @IsString()
    productionName?: string;

    @IsOptional()
    @IsDateString()
    productionDate?: string;

    @IsOptional()
    @IsArray()
    @Type(() => JobOrderLogDto)
    logs?: JobOrderLogDto[];
}
