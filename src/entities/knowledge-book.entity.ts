import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity('knowledge_books')
export class KnowledgeBook {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column()
    category: string;

    @Column({ name: 'file_type' })
    fileType: string;

    @Column({ name: 'file_path' })
    filePath: string;

    @Column({ name: 'file_name' })
    fileName: string;

    @Column({ name: 'file_size' })
    fileSize: number;

    @Column({ name: 'cover_image', nullable: true })
    coverImage: string;

    @Column({ nullable: true })
    author: string;

    @Column({ name: 'uploaded_by' })
    uploadedBy: string;

    @Column({ default: 0 })
    views: number;

    @Column({ default: 0 })
    downloads: number;

    @Column({ type: 'simple-array', default: '' })
    tags: string[];

    @Column({ name: 'is_published', default: true })
    isPublished: boolean;

    @Column({ name: 'training_date', nullable: true, type: 'timestamp' })
    trainingDate: Date;

    @Column({ nullable: true, default: 0 })
    attendees: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

@Entity('book_views')
export class BookView {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'book_id' })
    bookId: string;

    @ManyToOne(() => KnowledgeBook, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'book_id' })
    book: KnowledgeBook;

    @Column({ name: 'user_id' })
    userId: string;

    @CreateDateColumn({ name: 'viewed_at' })
    viewedAt: Date;
}
