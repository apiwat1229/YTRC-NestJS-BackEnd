import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { APPROVALS_APPROVE, APPROVALS_VIEW } from '../auth/constants/permissions';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { ApprovalsService } from './approvals.service';
import {
    ApproveDto,
    CancelDto,
    CreateApprovalRequestDto,
    RejectDto,
    ReturnDto,
    VoidDto,
} from './dto/approval.dto';

@ApiTags('approvals')
@Controller('approvals')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ApprovalsController {
    constructor(private readonly approvalsService: ApprovalsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new approval request' })
    @ApiResponse({ status: 201, description: 'Request created successfully' })
    create(@Body() dto: CreateApprovalRequestDto, @Request() req: any) {
        return this.approvalsService.createRequest(req.user.id, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all approval requests' })
    @ApiResponse({ status: 200, description: 'List of approval requests' })
    @Permissions(APPROVALS_VIEW)
    findAll(
        @Query('status') status?: string,
        @Query('entityType') entityType?: string,
        @Query('includeDeleted') includeDeleted?: string,
    ) {
        return this.approvalsService.findAll({
            status,
            entityType,
            includeDeleted: includeDeleted === 'true',
        });
    }

    @Get('my')
    @ApiOperation({ summary: 'Get current user\'s approval requests' })
    @ApiResponse({ status: 200, description: 'User\'s approval requests' })
    findMyRequests(@Request() req: any) {
        return this.approvalsService.findMyRequests(req.user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get single approval request by ID' })
    @ApiResponse({ status: 200, description: 'Approval request details' })
    @ApiResponse({ status: 404, description: 'Request not found' })
    @Permissions(APPROVALS_VIEW)
    findOne(@Param('id') id: string) {
        return this.approvalsService.findOne(id);
    }

    @Get(':id/history')
    @ApiOperation({ summary: 'Get approval request history (audit logs)' })
    @ApiResponse({ status: 200, description: 'Audit log entries' })
    getHistory(@Param('id') id: string) {
        return this.approvalsService.getHistory(id);
    }

    @Put(':id/approve')
    @ApiOperation({ summary: 'Approve a pending request' })
    @ApiResponse({ status: 200, description: 'Request approved successfully' })
    @ApiResponse({ status: 400, description: 'Invalid state transition' })
    @Permissions(APPROVALS_APPROVE)
    approve(@Param('id') id: string, @Body() dto: ApproveDto, @Request() req: any) {
        return this.approvalsService.approve(id, req.user.id, dto);
    }

    @Put(':id/reject')
    @ApiOperation({ summary: 'Reject a pending request' })
    @ApiResponse({ status: 200, description: 'Request rejected successfully' })
    @ApiResponse({ status: 400, description: 'Invalid state transition' })
    @Permissions(APPROVALS_APPROVE)
    reject(@Param('id') id: string, @Body() dto: RejectDto, @Request() req: any) {
        return this.approvalsService.reject(id, req.user.id, dto);
    }

    @Put(':id/return')
    @ApiOperation({ summary: 'Return a request for modification' })
    @ApiResponse({ status: 200, description: 'Request returned successfully' })
    @ApiResponse({ status: 400, description: 'Invalid state transition' })
    @Permissions(APPROVALS_APPROVE)
    returnForModification(@Param('id') id: string, @Body() dto: ReturnDto, @Request() req: any) {
        return this.approvalsService.return(id, req.user.id, dto);
    }

    @Put(':id/cancel')
    @ApiOperation({ summary: 'Cancel a pending request (requester only)' })
    @ApiResponse({ status: 200, description: 'Request cancelled successfully' })
    @ApiResponse({ status: 403, description: 'Only requester can cancel' })
    cancel(@Param('id') id: string, @Body() dto: CancelDto, @Request() req: any) {
        return this.approvalsService.cancel(id, req.user.id, dto);
    }

    @Put(':id/void')
    @ApiOperation({ summary: 'Void an approved request (admin only)' })
    @ApiResponse({ status: 200, description: 'Request voided successfully' })
    @ApiResponse({ status: 400, description: 'Only approved requests can be voided' })
    @Permissions(APPROVALS_APPROVE)
    void(@Param('id') id: string, @Body() dto: VoidDto, @Request() req: any) {
        return this.approvalsService.void(id, req.user.id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Soft delete an approval request' })
    @ApiResponse({ status: 200, description: 'Request deleted successfully' })
    @Permissions(APPROVALS_APPROVE)
    softDelete(@Param('id') id: string, @Request() req: any) {
        return this.approvalsService.softDelete(id, req.user.id);
    }
}
