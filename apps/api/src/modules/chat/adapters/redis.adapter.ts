import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisClusterService } from '../../../config/redis-cluster.config';
import * as Redis from 'ioredis';

export class RedisIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisIoAdapter.name);
  private adapterConstructor: ReturnType<typeof createAdapter>;

  constructor(
    private app: any,
    private configService: ConfigService,
    private redisClusterService: RedisClusterService,
  ) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    try {
      const nodes = [
        { 
          host: this.configService.get('REDIS_HOST', 'redis-master'),
          port: this.configService.get('REDIS_PORT', 6379)
        }
      ];

      const pubClient = new Redis.Cluster(nodes, {
        redisOptions: {
          password: this.configService.get('REDIS_PASSWORD', 'sl3_redis_password'),
          connectTimeout: 10000,
          commandTimeout: 10000,
        },
        scaleReads: 'slave',
        clusterRetryStrategy: (times) => Math.min(times * 100, 3000),
        enableReadyCheck: true,
        maxRedirections: 16,
      });

      const subClient = pubClient.duplicate();

      await Promise.all([
        new Promise<void>((resolve, reject) => {
          pubClient.on('connect', resolve);
          pubClient.on('error', reject);
        }),
        new Promise<void>((resolve, reject) => {
          subClient.on('connect', resolve);
          subClient.on('error', reject);
        }),
      ]);

      this.adapterConstructor = createAdapter(pubClient, subClient, {
        publishOnSpecificResponseChannel: true,
        requestsTimeout: 5000,
      });

      this.logger.log('Socket.IO Redis Adapter initialized with cluster configuration');
    } catch (error) {
      this.logger.error('Failed to initialize Socket.IO Redis Adapter:', error);
      throw error;
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000'),
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      connectTimeout: 45000,
      transports: ['websocket', 'polling'],
      allowUpgrades: true,
      upgradeTimeout: 10000,
      cookie: {
        name: 'sl3_socket_io',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 86400000,
      },
    });

    server.adapter(this.adapterConstructor);
    return server;
  }
}
