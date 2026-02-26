import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGLCodeDto {
    @ApiProperty({ example: 'A-ASST' })
    @IsString()
    @IsNotEmpty()
    transactionId: string;

    @ApiProperty({ example: 'Repair - fixed assets (Admin)' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ example: '6000-42' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ example: 'ซ่อมแซมบานพับ, เครื่อง GEN, โรงอาหาร, Office', required: false })
    @IsString()
    @IsOptional()
    purpose?: string;
}

export class UpdateGLCodeDto {
    @ApiProperty({ example: 'A-ASST', required: false })
    @IsString()
    @IsOptional()
    transactionId?: string;

    @ApiProperty({ example: 'Repair - fixed assets (Admin)', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: '6000-42', required: false })
    @IsString()
    @IsOptional()
    code?: string;

    @ApiProperty({ example: 'ซ่อมแซมบานพับ, เครื่อง GEN, โรงอาหาร, Office', required: false })
    @IsString()
    @IsOptional()
    purpose?: string;
}
