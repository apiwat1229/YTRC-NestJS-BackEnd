import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { NOTIFICATIONS_CREATE, NOTIFICATIONS_DELETE, NOTIFICATIONS_READ } from '../auth/constants/permissions';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { NotificationGroupsService } from './notification-groups.service';

@Controller('notification-groups')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NotificationGroupsController {
    constructor(private readonly groupsService: NotificationGroupsService) { }

    @Post()
    @Permissions(NOTIFICATIONS_CREATE)
    create(@Body() body: { name: string; description?: string; icon?: string; color?: string; memberIds?: string[] }) {
        return this.groupsService.create(body);
    }

    @Get()
    @Permissions(NOTIFICATIONS_READ)
    findAll() {
        return this.groupsService.findAll();
    }

    @Get(':id')
    @Permissions(NOTIFICATIONS_READ)
    findOne(@Param('id') id: string) {
        return this.groupsService.findOne(id);
    }

    @Patch(':id')
    @Permissions(NOTIFICATIONS_CREATE)
    update(
        @Param('id') id: string,
        @Body() body: { name?: string; description?: string; isActive?: boolean; icon?: string; color?: string; memberIds?: string[] },
    ) {
        return this.groupsService.update(id, body);
    }

    @Delete(':id')
    @Permissions(NOTIFICATIONS_DELETE)
    remove(@Param('id') id: string) {
        return this.groupsService.remove(id);
    }

    @Post(':id/members')
    @Permissions(NOTIFICATIONS_CREATE)
    addMembers(@Param('id') id: string, @Body() body: { userIds: string[] }) {
        return this.groupsService.addMembers(id, body.userIds);
    }

    @Delete(':id/members/:userId')
    @Permissions(NOTIFICATIONS_DELETE)
    removeMember(@Param('id') id: string, @Param('userId') userId: string) {
        return this.groupsService.removeMember(id, userId);
    }
}
