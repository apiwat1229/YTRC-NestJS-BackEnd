import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStockCategoryDto {
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
    prefix?: string;
}

export class UpdateStockCategoryDto {
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
    prefix?: string;
}
