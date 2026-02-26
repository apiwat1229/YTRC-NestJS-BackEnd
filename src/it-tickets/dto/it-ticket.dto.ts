import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateITTicketDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsString()
    category: string;

    @IsOptional()
    @IsString()
    priority?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    assetId?: string;

    @IsOptional()
    @IsNumber()
    quantity?: number;

    @IsOptional()
    @IsString()
    expectedDate?: string;

    @IsOptional()
    @IsString()
    approverId?: string;

    @IsOptional()
    isAssetRequest?: boolean;
}

export class UpdateITTicketDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    priority?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    assigneeId?: string;

    @IsOptional()
    @IsString()
    assetId?: string;

    @IsOptional()
    @IsNumber()
    quantity?: number;

    @IsOptional()
    @IsString()
    expectedDate?: string;

    @IsOptional()
    @IsString()
    approverId?: string;

    @IsOptional()
    isAssetRequest?: boolean;

    @IsOptional()
    @IsString()
    issuedAt?: string;

    @IsOptional()
    @IsString()
    issuedBy?: string;
}

export class CreateTicketCommentDto {
    @IsNotEmpty()
    @IsString()
    content: string;
}
