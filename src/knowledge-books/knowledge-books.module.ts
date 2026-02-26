import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookView, KnowledgeBook } from '../entities/knowledge-book.entity';
import { KnowledgeBooksController } from './knowledge-books.controller';
import { KnowledgeBooksService } from './knowledge-books.service';

@Module({
    imports: [TypeOrmModule.forFeature([KnowledgeBook, BookView])],
    controllers: [KnowledgeBooksController],
    providers: [KnowledgeBooksService],
    exports: [KnowledgeBooksService],
})
export class KnowledgeBooksModule { }
