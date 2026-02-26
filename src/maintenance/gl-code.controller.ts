import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateGLCodeDto, UpdateGLCodeDto } from './dto/gl-code.dto';
import { GLCodeService } from './gl-code.service';

@ApiTags('Maintenance - GL Codes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('maintenance/gl-codes')
export class GLCodeController {
    constructor(private readonly glCodeService: GLCodeService) { }

    @Get()
    @ApiOperation({ summary: 'Get all GL codes' })
    findAll() {
        return this.glCodeService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a GL code by ID' })
    findOne(@Param('id') id: string) {
        return this.glCodeService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new GL code' })
    create(@Body() createDto: CreateGLCodeDto) {
        return this.glCodeService.create(createDto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a GL code' })
    update(@Param('id') id: string, @Body() updateDto: UpdateGLCodeDto) {
        return this.glCodeService.update(id, updateDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a GL code' })
    remove(@Param('id') id: string) {
        return this.glCodeService.remove(id);
    }
}
