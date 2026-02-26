import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateProductionReportDto {
    @IsString()
    dryerName: string;

    @IsString()
    bookNo: string;

    @IsString()
    pageNo: string;

    @IsDateString()
    productionDate: string | Date;

    @IsString()
    shift: string;

    @IsString()
    grade: string;

    @IsOptional()
    @IsNumber()
    ratioCL?: number;

    @IsOptional()
    @IsNumber()
    ratioUSS?: number;

    @IsOptional()
    @IsNumber()
    ratioCutting?: number;

    @IsOptional()
    @IsNumber()
    weightPalletRemained?: number;

    @IsOptional()
    @IsNumber()
    sampleAccum1?: number;

    @IsOptional()
    @IsNumber()
    sampleAccum2?: number;

    @IsOptional()
    @IsNumber()
    sampleAccum3?: number;

    @IsOptional()
    @IsNumber()
    sampleAccum4?: number;

    @IsOptional()
    @IsNumber()
    sampleAccum5?: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductionReportRowDto)
    rows: ProductionReportRowDto[];

    @IsOptional()
    @IsString()
    baleBagLotNo?: string;

    @IsOptional()
    @IsString()
    checkedBy?: string;

    @IsOptional()
    @IsString()
    judgedBy?: string;

    @IsOptional()
    @IsString()
    issuedBy?: string;

    @IsOptional()
    @IsDateString()
    issuedAt?: string | Date;

    @IsOptional()
    @IsString()
    status?: string;
}

export class ProductionReportRowDto {
    @IsString()
    startTime: string;

    @IsString()
    palletType: string;

    @IsString()
    lotNo: string;

    @IsOptional()
    @IsNumber()
    weight1?: number;

    @IsOptional()
    @IsNumber()
    weight2?: number;

    @IsOptional()
    @IsNumber()
    weight3?: number;

    @IsOptional()
    @IsNumber()
    weight4?: number;

    @IsOptional()
    @IsNumber()
    weight5?: number;

    @IsOptional()
    @IsNumber()
    sampleCount?: number;
}
