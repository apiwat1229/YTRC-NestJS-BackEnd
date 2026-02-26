import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateRubberTypeDto {
    @IsString()
    @IsOptional()
    code?: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;

    @IsString()
    @IsOptional()
    status?: string;
}
