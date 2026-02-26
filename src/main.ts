import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
    try {
        console.log('🎬 Starting YTRC NestJS Backend...');

        // Ensure upload directories exist safely
        try {
            const uploadDirs = [
                'uploads',
                'uploads/avatars',
                'uploads/it-asset',
                'uploads/knowledge-books',
            ];
            const rootDir = process.cwd();
            uploadDirs.forEach(dir => {
                const fullPath = join(rootDir, dir);
                console.log(`📁 Checking/Creating directory: ${fullPath}`);
                if (!existsSync(fullPath)) {
                    mkdirSync(fullPath, { recursive: true });
                }
            });
        } catch (e: any) {
            console.warn('⚠️ Could not create upload directories:', e.message);
        }

        const app = await NestFactory.create(AppModule);

        // Enable CORS with robust settings
        app.enableCors({
            origin: true,
            credentials: true,
            methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With'],
        });

        // Enable validation
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                transform: true,
                forbidNonWhitelisted: false,
            })
        );

        // Global prefix
        app.setGlobalPrefix('api');

        // Swagger UI
        const swaggerConfig = new DocumentBuilder()
            .setTitle('YTRC Center API')
            .setDescription('YTRC NestJS Backend API Documentation')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = SwaggerModule.createDocument(app, swaggerConfig);
        SwaggerModule.setup('api/docs', app, document);

        const port = process.env.API_PORT || 2530;
        await app.listen(port, '0.0.0.0');

        console.log(`🚀 API Server is running on: http://localhost:${port}/api`);
        console.log(`🌍 Production URL: https://app.ytrc.co.th/api`);
        console.log(`🔑 CORS: Enabled (Mirroring Origin)`);
    } catch (error: any) {
        console.error('❌ FATAL ERROR DURING BOOTSTRAP:', error);
        process.exit(1);
    }
}

bootstrap();
