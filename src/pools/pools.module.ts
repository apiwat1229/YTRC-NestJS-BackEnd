import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pool, PoolItem } from '../entities/pool.entity';
import { PoolsController } from './pools.controller';
import { PoolsService } from './pools.service';

@Module({
    imports: [TypeOrmModule.forFeature([Pool, PoolItem])],
    controllers: [PoolsController],
    providers: [PoolsService],
    exports: [PoolsService],
})
export class PoolsModule { }
