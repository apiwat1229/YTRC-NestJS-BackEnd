import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateRawMaterialPlanDto {
    @IsString()
    planNo: string;

    @IsString()
    revisionNo: string;

    @IsString()
    refProductionNo: string;

    @IsOptional()
    issuedDate: string | Date;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RawMaterialPlanRowDto)
    rows: RawMaterialPlanRowDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RawMaterialPlanPoolDetailDto)
    poolDetails: RawMaterialPlanPoolDetailDto[];

    @IsOptional()
    @IsString()
    issueBy?: string;

    @IsOptional()
    @IsString()
    verifiedBy?: string;

    @IsOptional()
    @IsString()
    status?: string;
}

export class RawMaterialPlanRowDto {
    @IsOptional()
    date: string | Date;

    @IsString()
    dayOfWeek: string;

    @IsString()
    shift: string;

    @IsOptional()
    @IsString()
    productionMode?: string;

    @IsOptional()
    @IsString()
    grade: string;

    @IsOptional()
    ratioUSS?: number | string;

    @IsOptional()
    ratioCL?: number | string;

    @IsOptional()
    ratioBK?: number | string;

    @IsOptional()
    productTarget?: number | string;

    @IsOptional()
    clConsumption?: number | string;

    @IsOptional()
    ratioBorC?: number | string;

    // Plan 1-3
    @IsOptional()
    @IsArray()
    plan1Pool?: string[]; // Frontend sends array, Schema expects string? Or comma joined? Schema says String.

    @IsOptional()
    @IsNumber()
    plan1Scoops?: number;

    @IsOptional()
    @IsArray()
    plan1Grades?: string[]; // Not in schema directly? 
    // Wait, Schema has plan1Pool String, plan1Note String. 
    // Frontend sends plan1Pool [], plan1Grades [].
    // I need to join them to string for storage or update schema.
    // Schema: plan1Pool String?
    // Let's assume we join them with commas or store JSON string if possible? 
    // Schema is String. I will join arrays with ',' in Service.

    @IsOptional()
    @IsArray()
    plan2Pool?: string[];

    @IsOptional()
    @IsNumber()
    plan2Scoops?: number;

    @IsOptional()
    @IsArray()
    plan2Grades?: string[];

    @IsOptional()
    @IsArray()
    plan3Pool?: string[];

    @IsOptional()
    @IsNumber()
    plan3Scoops?: number;

    @IsOptional()
    @IsArray()
    plan3Grades?: string[];

    @IsOptional()
    cuttingPercent?: number | string;

    @IsOptional()
    cuttingPalette?: number | string;

    @IsOptional()
    @IsString()
    remarks?: string;
}

export class RawMaterialPlanPoolDetailDto {
    @IsString()
    poolNo: string;

    @IsOptional()
    grossWeight?: number | string;

    @IsOptional()
    netWeight?: number | string;

    @IsOptional()
    drc?: number | string;

    @IsOptional()
    moisture?: number | string;

    @IsOptional()
    p0?: number | string;

    @IsOptional()
    pri?: number | string;

    @IsOptional()
    clearDate?: string | Date;

    @IsOptional()
    grade?: string[] | string;
}
