import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRubberTypeDto {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;

    // Optional status field if frontend sends it as string (supporting legacy/alternative payloads)
    @IsString()
    @IsOptional()
    status?: string;
}
