import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../entities/post.entity';
import { RubberType } from '../entities/rubber-type.entity';
import { Supplier } from '../entities/supplier.entity';
import { User } from '../entities/user.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
    imports: [TypeOrmModule.forFeature([User, Supplier, RubberType, Post])],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
})
export class AnalyticsModule { }
