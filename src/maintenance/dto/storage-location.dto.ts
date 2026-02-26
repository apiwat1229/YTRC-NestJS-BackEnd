import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStorageLocationDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    nameEN?: string;

    @IsOptional()
    @IsString()
    nameTH?: string;

    @IsOptional()
    @IsString()
    building?: string;

    @IsOptional()
    @IsString()
    zone?: string;
}

export class UpdateStorageLocationDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    nameEN?: string;

    @IsOptional()
    @IsString()
    nameTH?: string;

    @IsOptional()
    @IsString()
    building?: string;

    @IsOptional()
    @IsString()
    zone?: string;
}
