import { CreateITAssetDto, UpdateITAssetDto } from '../types';
import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ITAssetsService } from './it-assets.service';

@Controller('it-assets')
@UseGuards(JwtAuthGuard)
export class ITAssetsController {
    constructor(private readonly itAssetsService: ITAssetsService) { }

    @Post()
    create(@Body() createDto: CreateITAssetDto) {
        return this.itAssetsService.create(createDto);
    }

    @Get()
    findAll() {
        return this.itAssetsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.itAssetsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateITAssetDto) {
        return this.itAssetsService.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.itAssetsService.remove(id);
    }

    @Post(':id/image')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = './uploads/it-asset';
                if (!existsSync(uploadPath)) {
                    mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    async uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
        return this.itAssetsService.updateImage(id, `/uploads/it-asset/${file.filename}`);
    }
}
