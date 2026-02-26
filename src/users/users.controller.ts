import { CreateUserDto, UpdateUserDto } from '../types';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @Permissions('users:create')
    @UseGuards(PermissionsGuard)
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @Permissions('users:update')
    @UseGuards(PermissionsGuard)
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @Permissions('users:delete')
    @UseGuards(PermissionsGuard)
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }

    @Patch(':id/unlock')
    @Permissions('users:update')
    @UseGuards(PermissionsGuard)
    async unlockUser(@Param('id') id: string) {
        return this.usersService.unlockUser(id);
    }

    @Post(':id/avatar')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = './uploads/avatars';
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
    @Permissions('users:update')
    @UseGuards(PermissionsGuard)
    async uploadAvatar(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
        return this.usersService.updateAvatar(id, `/uploads/avatars/${file.filename}`);
    }
}
