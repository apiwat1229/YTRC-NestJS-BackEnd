import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateITTicketDto, CreateTicketCommentDto, UpdateITTicketDto } from './dto/it-ticket.dto';

import { ITTicketsService } from './it-tickets.service';

@Controller('it-tickets')
@UseGuards(JwtAuthGuard)
export class ITTicketsController {
    constructor(private readonly itTicketsService: ITTicketsService) { }

    @Post()
    create(@Request() req, @Body() createDto: CreateITTicketDto) {
        return this.itTicketsService.create(req.user.userId, createDto);
    }

    @Get()
    findAll(@Request() req) {
        // Simple logic: if IT dept, see all.
        const isIT = req.user.department === 'Information Technology' || req.user.department === 'เทคโนโลยีสารสนเทศ (IT)';
        return this.itTicketsService.findAll(req.user.userId, isIT);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.itTicketsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateITTicketDto) {
        return this.itTicketsService.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.itTicketsService.remove(id);
    }

    @Post(':id/comments')
    createComment(
        @Param('id') id: string,
        @Request() req,
        @Body() createDto: CreateTicketCommentDto
    ) {
        return this.itTicketsService.addComment(id, req.user.userId, createDto);
    }
}
