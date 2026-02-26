import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalsModule } from '../approvals/approvals.module';
import { RubberType } from '../entities/rubber-type.entity';
import { RubberTypesController } from './rubber-types.controller';
import { RubberTypesService } from './rubber-types.service';

@Module({
    imports: [TypeOrmModule.forFeature([RubberType]), ApprovalsModule],
    controllers: [RubberTypesController],
    providers: [RubberTypesService],
})
export class RubberTypesModule { }
