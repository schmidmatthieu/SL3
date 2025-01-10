import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IRedisService } from '../redis';
import { INestApplicationContext } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisIoAdapter.name);
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private readonly redisService: IRedisService;
  private readonly configService: ConfigService;

  constructor(app: INestApplicationContext, redisService: IRedisService, configService: ConfigService) {
    super(app);
    this.redisService = redisService;
    this.configService = configService;
  }

  async connectToRedis(): Promise<void> {
    try {
      this.logger.debug('Tentative de connexion au Redis pour Socket.IO');

      // Vérifier la connexion Redis
      const isConnected = await this.redisService.ping();
      if (!isConnected) {
        throw new Error('Redis n\'est pas disponible');
      }

      // Obtenir le client Redis principal
      const pubClient = (this.redisService as any).getClient();
      this.logger.debug('Client Redis principal obtenu');

      // Créer un client dupliqué pour les subscriptions
      const subClient = pubClient.duplicate();
      this.logger.debug('Client Redis dupliqué créé');

      // Configuration des événements pour le client pub
      pubClient.on('connect', () => {
        this.logger.log('Socket.IO Redis pub client connecté');
      });

      pubClient.on('error', (error) => {
        this.logger.error(`Erreur Socket.IO Redis pub client: ${error.message}`);
      });

      // Configuration des événements pour le client sub
      subClient.on('connect', () => {
        this.logger.log('Socket.IO Redis sub client connecté');
      });

      subClient.on('error', (error) => {
        this.logger.error(`Erreur Socket.IO Redis sub client: ${error.message}`);
      });

      // Créer l'adaptateur Redis pour Socket.IO
      this.adapterConstructor = createAdapter(pubClient, subClient);
      this.logger.log('Adaptateur Redis pour Socket.IO créé avec succès');
    } catch (error) {
      this.logger.error(`Erreur lors de la connexion à Redis: ${error.message}`);
      throw error;
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const corsOptions = {
      origin: this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000'),
      credentials: true,
    };

    const server = super.createIOServer(port, {
      ...options,
      cors: corsOptions,
      allowEIO3: true,
      transports: ['websocket', 'polling'],
    });

    server.adapter(this.adapterConstructor);
    return server;
  }
}
