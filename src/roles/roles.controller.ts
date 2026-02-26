

import { CreateRoleDto, UpdateRoleDto } from '../types';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ROLES_CREATE, ROLES_DELETE, ROLES_READ, ROLES_UPDATE } from '../auth/constants/permissions';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesService } from './roles.service';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Get()
    @Permissions(ROLES_READ)
    findAll() {
        return this.rolesService.findAll();
    }

    @Get(':id')
    @Permissions(ROLES_READ)
    findOne(@Param('id') id: string) {
        return this.rolesService.findOne(id);
    }

    @Post()
    @Permissions(ROLES_CREATE)
    create(@Body() body: CreateRoleDto) {
        return this.rolesService.create(body);
    }

    @Patch(':id')
    @Permissions(ROLES_UPDATE)
    update(@Param('id') id: string, @Body() body: UpdateRoleDto) {
        return this.rolesService.update(id, body);
    }

    @Delete(':id')
    @Permissions(ROLES_DELETE)
    remove(@Param('id') id: string) {
        return this.rolesService.remove(id);
    }
}
