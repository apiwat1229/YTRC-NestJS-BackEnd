import { BadRequestException, Body, Controller, Delete, Get, Logger, Param, Patch, Post, Query, Request, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname, resolve } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateBookDto, KnowledgeBooksService, UpdateBookDto } from './knowledge-books.service';

// File upload configuration
const storage = diskStorage({
    destination: './uploads/knowledge-books',
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

@Controller('knowledge-books')
@UseGuards(JwtAuthGuard)
export class KnowledgeBooksController {
    private readonly logger = new Logger(KnowledgeBooksController.name);
    constructor(private readonly knowledgeBooksService: KnowledgeBooksService) { }

    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage,
            limits: {
                fileSize: 50 * 1024 * 1024, // 50MB
            },
        })
    )
    async upload(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any,
        @Request() req: any
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        if (file.mimetype !== 'application/pdf') {
            throw new BadRequestException('Invalid file type: Only PDF files are allowed');
        }

        const fileType = 'pdf';

        const createData: CreateBookDto = {
            title: body.title,
            description: body.description,
            category: body.category,
            fileType,
            fileName: file.originalname,
            filePath: file.path,
            fileSize: file.size,
            author: body.author,
            tags: body.tags ? JSON.parse(body.tags) : [],
            uploadedBy: req.user.userId,
            trainingDate: body.trainingDate ? new Date(body.trainingDate) : undefined,
            attendees: body.attendees ? parseInt(body.attendees) : 0,
        };

        return this.knowledgeBooksService.create(createData);
    }

    @Get()
    findAll(
        @Query('category') category?: string,
        @Query('search') search?: string,
        @Query('tags') tags?: string,
        @Query('uploadedBy') uploadedBy?: string
    ) {
        return this.knowledgeBooksService.findAll({
            category,
            search,
            tags: tags ? tags.split(',') : undefined,
            uploadedBy,
            isPublished: true,
        });
    }

    @Get('categories')
    getCategories() {
        return this.knowledgeBooksService.getCategories();
    }

    @Get('stats')
    getStats() {
        return this.knowledgeBooksService.getStats();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.knowledgeBooksService.findOne(id);
    }

    @Get(':id/file')
    async getFile(@Param('id') id: string, @Res() res: Response, @Request() req: any) {
        this.logger.debug(`File request for: ${id} from user: ${req.user?.userId}`);
        const book = await this.knowledgeBooksService.findOne(id);

        // Serve PDF
        const filePath = book.filePath;

        // Ensure path is absolute
        const absolutePath = resolve(process.cwd(), filePath);

        res.sendFile(absolutePath, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${encodeURIComponent(book.fileName)}"`,
            }
        });
    }

    @Get(':id/download')
    async downloadFile(@Param('id') id: string, @Res() res: Response, @Request() req: any) {
        this.logger.debug(`Download request for: ${id} from user: ${req.user?.userId}`);
        const book = await this.knowledgeBooksService.findOne(id);

        // Increment download count
        await this.knowledgeBooksService.incrementDownload(id);

        // Ensure path is absolute
        const absolutePath = resolve(process.cwd(), book.filePath);

        res.download(absolutePath, book.fileName);
    }

    @Post(':id/view')
    async trackView(@Param('id') id: string, @Request() req: any) {
        await this.knowledgeBooksService.trackView(id, req.user.userId);
        return { message: 'View tracked successfully' };
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateData: UpdateBookDto) {
        return this.knowledgeBooksService.update(id, updateData);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.knowledgeBooksService.remove(id);
    }
}
