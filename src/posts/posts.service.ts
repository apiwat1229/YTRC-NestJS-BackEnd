import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { CreatePostDto, UpdatePostDto } from '../types';

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(Post)
        private postRepo: Repository<Post>
    ) { }

    async create(createPostDto: CreatePostDto, authorId: string) {
        const post = this.postRepo.create({ ...createPostDto as any, authorId });
        return this.postRepo.save(post);
    }

    async findAll(published?: boolean) {
        const where: any = published !== undefined ? { published } : {};
        return this.postRepo.find({ where, order: { createdAt: 'DESC' } });
    }

    async findOne(id: string) {
        const post = await this.postRepo.findOne({ where: { id } });
        if (!post) throw new NotFoundException(`Post with ID ${id} not found`);
        return post;
    }

    async update(id: string, updatePostDto: UpdatePostDto, userId: string, userRole: string) {
        const post = await this.findOne(id);
        if (post.authorId !== userId && userRole !== 'ADMIN') throw new ForbiddenException('You can only update your own posts');
        await this.postRepo.update(id, updatePostDto as any);
        return this.findOne(id);
    }

    async remove(id: string, userId: string, userRole: string) {
        const post = await this.findOne(id);
        if (post.authorId !== userId && userRole !== 'ADMIN') throw new ForbiddenException('You can only delete your own posts');
        return this.postRepo.delete(id);
    }
}
