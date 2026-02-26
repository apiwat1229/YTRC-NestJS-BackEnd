import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RawMaterialPlan, RawMaterialPlanPoolDetail, RawMaterialPlanRow } from '../entities/raw-material-plan.entity';
import { RawMaterialPlansController } from './raw-material-plans.controller';
import { RawMaterialPlansService } from './raw-material-plans.service';

@Module({
    imports: [TypeOrmModule.forFeature([RawMaterialPlan, RawMaterialPlanRow, RawMaterialPlanPoolDetail])],
    controllers: [RawMaterialPlansController],
    providers: [RawMaterialPlansService],
})
export class RawMaterialPlansModule { }
