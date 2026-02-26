import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { District, Province, Subdistrict } from '../entities/master.entity';
import { RubberType } from '../entities/rubber-type.entity';
import { MasterController } from './master.controller';
import { MasterService } from './master.service';

@Module({
    imports: [TypeOrmModule.forFeature([Province, District, Subdistrict, RubberType])],
    controllers: [MasterController],
    providers: [MasterService],
})
export class MasterModule { }
