import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalsModule } from '../approvals/approvals.module';
import { RubberType } from '../entities/rubber-type.entity';
import { Supplier } from '../entities/supplier.entity';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';

@Module({
    imports: [TypeOrmModule.forFeature([Supplier, RubberType]), ApprovalsModule],
    controllers: [SuppliersController],
    providers: [SuppliersService],
})
export class SuppliersModule { }
