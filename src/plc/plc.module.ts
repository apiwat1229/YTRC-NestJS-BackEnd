import { Module } from '@nestjs/common';
import { PlcController } from './plc.controller';
import { PlcService } from './plc.service';

@Module({
    providers: [PlcService],
    controllers: [PlcController],
    exports: [PlcService],
})
export class PlcModule { }
