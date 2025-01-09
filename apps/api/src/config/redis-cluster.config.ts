import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cluster } from 'ioredis';
import * as Redis from 'ioredis';

@Injectable()
export class RedisClusterService implements OnModuleDestroy, OnModuleInit {
  private readonly logger = new Logger(RedisClusterService.name);
  private client: Cluster;
  private isConnecting: boolean = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    if (this.client && this.client.status === 'ready') {
      this.logger.log('Redis client already connected');
      return;
    }

    this.initializeCluster();
  }

  private async initializeCluster() {
    if (this.isConnecting) {
      this.logger.log('Already attempting to connect to Redis Cluster');
      return;
    }

    try {
      this.isConnecting = true;
      const nodes = [
        { 
          host: 'localhost',
          port: 6379
        },
        {
          host: 'localhost',
          port: 6380
        },
        {
          host: 'localhost',
          port: 6381
        },
        {
          host: 'localhost',
          port: 6382
        },
        {
          host: 'localhost',
          port: 6383
        },
        {
          host: 'localhost',
          port: 6384
        }
      ];

      this.client = new Redis.Cluster(nodes, {
        redisOptions: {
          password: this.configService.get('REDIS_PASSWORD', 'sl3_redis_password'),
          connectTimeout: 30000,
          maxRetriesPerRequest: 5
        },
        clusterRetryStrategy: (times: number) => {
          const delay = Math.min(times * 200, 2000);
          this.logger.log(`Retrying cluster connection in ${delay}ms... Attempt ${times}`);
          return delay;
        },
        enableReadyCheck: true,
        maxRedirections: 16,
        retryDelayOnFailover: 2000,
        retryDelayOnClusterDown: 2000,
        retryDelayOnTryAgain: 2000,
        slotsRefreshTimeout: 10000,
        slotsRefreshInterval: 15000,
        scaleReads: 'slave'
      });

      this.client.on('connect', () => {
        this.logger.log('Connected to Redis Cluster');
        this.isConnecting = false;
      });

      this.client.on('ready', () => {
        this.logger.log('Redis Cluster is ready to accept commands');
      });

      this.client.on('error', (error) => {
        this.logger.error('Redis Cluster Error:', error);
      });

      this.client.on('close', () => {
        this.logger.warn('Redis Cluster Connection closed');
        if (!this.client || this.client.status !== 'ready') {
          this.logger.log('Attempting to reconnect to Redis Cluster');
          this.reconnect();
        }
      });

      await this.client.connect();
    } catch (error) {
      this.logger.error('Failed to initialize Redis Cluster:', error);
      this.isConnecting = false;
      if (!error.message.includes('Redis is already connecting/connected')) {
        setTimeout(() => this.reconnect(), 2000);
      }
    }
  }

  private reconnect() {
    this.logger.log('Attempting to reconnect to Redis Cluster');
    setTimeout(() => {
      this.initializeCluster();
    }, 2000);
  }

  getClient(): Cluster {
    return this.client;
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
    }
  }
}
