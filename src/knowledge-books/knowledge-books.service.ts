import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs/promises';
import { Repository } from 'typeorm';
import { BookView, KnowledgeBook } from '../entities/knowledge-book.entity';

export interface CreateBookDto {
    title: string; description?: string; category: string; fileType: string; fileName: string;
    filePath: string; fileSize: number; coverImage?: string; author?: string; tags?: string[];
    uploadedBy: string; trainingDate?: Date; attendees?: number;
}
export interface UpdateBookDto {
    title?: string; description?: string; category?: string; author?: string; tags?: string[];
    isPublished?: boolean; trainingDate?: Date; attendees?: number;
}
export interface BookFilters { category?: string; search?: string; tags?: string[]; uploadedBy?: string; isPublished?: boolean; }

@Injectable()
export class KnowledgeBooksService {
    private readonly logger = new Logger(KnowledgeBooksService.name);

    constructor(
        @InjectRepository(KnowledgeBook)
        private bookRepo: Repository<KnowledgeBook>,
        @InjectRepository(BookView)
        private bookViewRepo: Repository<BookView>
    ) { }

    async create(data: CreateBookDto): Promise<KnowledgeBook> {
        const book = this.bookRepo.create({ ...data, tags: data.tags || [] });
        return this.bookRepo.save(book);
    }

    async findAll(filters?: BookFilters): Promise<KnowledgeBook[]> {
        const qb = this.bookRepo.createQueryBuilder('b');
        if (filters?.category) qb.andWhere('b.category = :category', { category: filters.category });
        if (filters?.search) qb.andWhere('(b.title LIKE :search OR b.description LIKE :search OR b.author LIKE :search)', { search: `%${filters.search}%` });
        if (filters?.uploadedBy) qb.andWhere('b.uploadedBy = :uploadedBy', { uploadedBy: filters.uploadedBy });
        if (filters?.isPublished !== undefined) qb.andWhere('b.isPublished = :isPublished', { isPublished: filters.isPublished });
        return qb.orderBy('b.createdAt', 'DESC').getMany();
    }

    async findOne(id: string): Promise<KnowledgeBook> {
        const book = await this.bookRepo.findOne({ where: { id } });
        if (!book) throw new NotFoundException(`Book with ID ${id} not found`);
        return book;
    }

    async update(id: string, data: UpdateBookDto): Promise<KnowledgeBook> {
        await this.findOne(id);
        await this.bookRepo.update(id, data as any);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        const book = await this.findOne(id);
        try { await fs.unlink(book.filePath); } catch (e) { this.logger.warn(`Could not delete file: ${book.filePath}`); }
        if (book.coverImage) { try { await fs.unlink(book.coverImage); } catch (e) { } }
        await this.bookViewRepo.delete({ bookId: id });
        await this.bookRepo.delete(id);
    }

    async trackView(bookId: string, userId: string): Promise<void> {
        await this.findOne(bookId);
        const view = this.bookViewRepo.create({ bookId, userId });
        await this.bookViewRepo.save(view);
        await this.bookRepo.increment({ id: bookId }, 'views', 1);
    }

    async incrementDownload(bookId: string): Promise<void> {
        return this.trackDownload(bookId);
    }

    async trackDownload(bookId: string): Promise<void> {
        await this.findOne(bookId);
        await this.bookRepo.increment({ id: bookId }, 'downloads', 1);
    }

    async getCategories(): Promise<string[]> {
        const results = await this.bookRepo.createQueryBuilder('b').select('DISTINCT b.category', 'category').where('b.isPublished = true').getRawMany();
        return results.map(r => r.category);
    }

    async getStats(): Promise<any> {
        const stats = await this.bookRepo.createQueryBuilder('b')
            .select('COUNT(b.id)', 'totalBooks')
            .addSelect('SUM(b.views)', 'totalViews')
            .addSelect('SUM(b.downloads)', 'totalDownloads')
            .getRawOne();
        return {
            totalBooks: parseInt(stats.totalBooks) || 0,
            totalViews: parseInt(stats.totalViews) || 0,
            totalDownloads: parseInt(stats.totalDownloads) || 0
        };
    }
}
