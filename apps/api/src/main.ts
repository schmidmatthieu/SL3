import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: configService.get('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Cross-Origin-Resource-Policy', 'Cross-Origin-Opener-Policy', 'Cross-Origin-Embedder-Policy'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Set global prefix for API routes only
  app.setGlobalPrefix('api', {
    exclude: ['/uploads/*'],
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('SL3 Beta API')
    .setDescription('The API documentation for SL3 Beta')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Add security headers middleware for all routes
  app.use((req, res, next) => {
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.header('Cross-Origin-Embedder-Policy', 'credentialless');
    next();
  });

  // Serve static files from public directory
  const publicPath = join(__dirname, '..', '..', 'public');
  
  // Middleware spécifique pour les fichiers dans /uploads
  app.use('/uploads', (req, res, next) => {
    express.static(join(publicPath, 'uploads'), {
      index: false,
      setHeaders: (res) => {
        res.set({
          'Cross-Origin-Resource-Policy': 'cross-origin',
          'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
          'Cross-Origin-Embedder-Policy': 'credentialless',
        });
      }
    })(req, res, next);
  });

  // Start the server
  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);
}

bootstrap();
