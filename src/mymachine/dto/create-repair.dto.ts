import { IsArray, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class RepairPartDto {
    @IsNumber()
    id: number;

    @IsString()
    name: string;

    @IsNumber()
    qty: number;

    @IsNumber()
    price: number;

    @IsOptional()
    isStock?: boolean;
}

export class CreateRepairDto {
    @IsString()
    machineId: string;

    @IsString()
    machineName: string;

    @IsDateString()
    date: string;

    @IsString()
    issue: string;

    @IsString()
    technician: string;

    @IsArray()
    @IsOptional()
    parts?: RepairPartDto[];

    @IsArray()
    @IsOptional()
    images?: string[];

    @IsString()
    @IsOptional()
    status?: string;

    @IsNumber()
    @IsOptional()
    totalCost?: number;
}
