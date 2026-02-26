import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CpkAnalysis } from '../entities/cpk-analysis.entity';
import { CpkAnalysesController } from './cpk-analyses.controller';
import { CpkAnalysesService } from './cpk-analyses.service';

@Module({
    imports: [TypeOrmModule.forFeature([CpkAnalysis])],
    controllers: [CpkAnalysesController],
    providers: [CpkAnalysesService],
})
export class CpkAnalysesModule { }
