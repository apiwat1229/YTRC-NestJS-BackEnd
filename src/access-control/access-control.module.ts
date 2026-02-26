import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { AccessControlController } from './access-control.controller';
import { AccessControlService } from './access-control.service';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [AccessControlController],
    providers: [AccessControlService],
    exports: [AccessControlService],
})
export class AccessControlModule { }
