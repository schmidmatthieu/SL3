import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import { RedisIoAdapter } from './adapters/redis-io.adapter';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { IRedisService, REDIS_PROVIDER } from './redis';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const redisService = app.get<IRedisService>(REDIS_PROVIDER);
  const logger = new Logger('Main');

  logger.log('Starting application in ' + process.env.NODE_ENV + ' mode');

  // Enable CORS with WebSocket support
  const corsOrigin = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
  logger.log('CORS enabled for origin: ' + corsOrigin);
  
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Cross-Origin-Resource-Policy', 'Cross-Origin-Opener-Policy', 'Cross-Origin-Embedder-Policy'],
  });

  // Initialiser Redis avant de configurer l'adaptateur
  logger.debug('Initialisation de Redis...');
  try {
    await redisService.waitForConnection();
    logger.log('Redis initialisé avec succès');
  } catch (error) {
    logger.error(`Erreur lors de l'initialisation de Redis: ${error.message}`);
    throw error;
  }

  // Configure Redis adapter for WebSocket
  logger.debug('Configuration de l\'adaptateur Redis pour WebSocket');
  const redisIoAdapter = new RedisIoAdapter(app, redisService, configService);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);
  logger.log('Adaptateur WebSocket configuré avec Redis');

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
    exclude: ['/health'],
  });

  // Use helmet for security
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  }));

  // Parse cookies
  app.use(cookieParser());

  // Serve static files
  app.use('/uploads', express.static(join(process.cwd(), 'public', 'uploads')));

  // Configure Swagger
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('SL3 API')
      .setDescription('The SL3 API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}

bootstrap().catch(err => {
  console.error('Failed to bootstrap application:', err);
  process.exit(1);
});
