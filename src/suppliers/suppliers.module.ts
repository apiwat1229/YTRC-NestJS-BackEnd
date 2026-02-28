import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalsModule } from '../approvals/approvals.module';
import { District, Province, Subdistrict } from '../entities/master.entity';
import { RubberType } from '../entities/rubber-type.entity';
import { Supplier } from '../entities/supplier.entity';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';

@Module({
    imports: [TypeOrmModule.forFeature([Supplier, RubberType, Province, District, Subdistrict]), ApprovalsModule],
    controllers: [SuppliersController],
    providers: [SuppliersService],
})
export class SuppliersModule { }
