import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCpkAnalysisDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsNumber()
    lsl: number;

    @ApiProperty()
    @IsNumber()
    usl: number;

    @ApiProperty()
    @IsNumber()
    subgroupSize: number;

    @ApiProperty({ type: [Number] })
    @IsArray()
    @IsNumber({}, { each: true })
    dataPoints: number[];

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    note?: string;
}
