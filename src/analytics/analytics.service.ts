import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { RubberType } from '../entities/rubber-type.entity';
import { Supplier } from '../entities/supplier.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(Supplier)
        private supplierRepo: Repository<Supplier>,
        @InjectRepository(RubberType)
        private rubberTypeRepo: Repository<RubberType>,
        @InjectRepository(Post)
        private postRepo: Repository<Post>
    ) { }

    async getStats() {
        try {
            const [totalUsers, activeUsers, totalSuppliers, totalRubberTypes, totalPosts] = await Promise.all([
                this.userRepo.count(),
                this.userRepo.count({ where: { status: 'ACTIVE' } }),
                this.supplierRepo.count(),
                this.rubberTypeRepo.count(),
                this.postRepo.count(),
            ]);
            const estimatedDataPoints = totalUsers + totalSuppliers + totalRubberTypes + totalPosts;
            return {
                system: { status: 'online', uptime: process.uptime(), timestamp: new Date().toISOString(), version: '1.0.0' },
                data: { totalUsers, totalSuppliers, totalRubberTypes, totalPosts, estimatedDataPoints },
                users: { active: activeUsers, total: totalUsers },
            };
        } catch (error) {
            console.error('Error fetching analytics:', error);
            throw error;
        }
    }
}
