#!/usr/bin/env node

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: 'http://localhost:8100',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID'],
    });

    if (Number(process.env.SWAGGER) === 1) {
        const config = new DocumentBuilder()
            .setTitle('WMID-API')
            .setVersion(process.env.npm_package_version)
            .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('/swagger', app, document);
    }

    await app.listen(process.env.PORT);
}
bootstrap();
