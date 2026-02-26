import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateStorageLocationDto, UpdateStorageLocationDto } from './dto/storage-location.dto';
import { StorageLocationService } from './storage-location.service';

@Controller('mymachine/locations')
export class StorageLocationController {
    constructor(private readonly storageLocationService: StorageLocationService) { }

    @Get()
    findAll() {
        return this.storageLocationService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.storageLocationService.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateStorageLocationDto) {
        return this.storageLocationService.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateStorageLocationDto) {
        return this.storageLocationService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.storageLocationService.remove(id);
    }
}
