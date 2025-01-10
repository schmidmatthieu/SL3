import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cluster, ClusterNode, ClusterOptions, RedisOptions } from 'ioredis';
import { IRedisService } from '../redis';

@Injectable()
export class RedisClusterService implements OnModuleDestroy, OnModuleInit, IRedisService {
  private readonly logger = new Logger(RedisClusterService.name);
  private client: Cluster | null = null;
  private connectionPromise: Promise<void> | null = null;
  private isInitialized = false;
  private readonly maxRetries = 5;
  private retryCount = 0;

  constructor(private configService: ConfigService) {}

  // Méthodes IRedisService
  async get(key: string): Promise<string | null> {
    return this.getClient().get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.getClient().set(key, value, 'EX', ttl);
    } else {
      await this.getClient().set(key, value);
    }
  }

  async del(...keys: string[]): Promise<number> {
    return this.getClient().del(...keys);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.getClient().exists(key);
    return result === 1;
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    const result = await this.getClient().expire(key, ttl);
    return result === 1;
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    return this.getClient().mget(keys);
  }

  async mset(keyValueMap: Record<string, string>): Promise<void> {
    await this.getClient().mset(keyValueMap);
  }

  async incr(key: string): Promise<number> {
    return this.getClient().incr(key);
  }

  async decr(key: string): Promise<number> {
    return this.getClient().decr(key);
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.getClient().sadd(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return this.getClient().smembers(key);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return this.getClient().srem(key, ...members);
  }

  async ping(): Promise<boolean> {
    try {
      const result = await this.getClient().ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error(`Erreur lors du ping: ${error.message}`);
      return false;
    }
  }

  // Méthodes existantes
  async onModuleInit() {
    if (!this.isInitialized) {
      await this.initializeCluster();
      this.isInitialized = true;
    }
  }

  getClient(): Cluster {
    if (!this.client || !this.isInitialized) {
      throw new Error('Le client Redis n\'est pas initialisé');
    }
    return this.client;
  }

  async waitForConnection(): Promise<void> {
    if (!this.connectionPromise) {
      throw new Error('Redis n\'a pas encore commencé à se connecter');
    }
    return this.connectionPromise;
  }

  private getDefaultNodes(): ClusterNode[] {
    return [
      { host: 'localhost', port: 6379 },
      { host: 'localhost', port: 6380 },
      { host: 'localhost', port: 6381 }
    ];
  }

  private async checkClusterHealth(): Promise<boolean> {
    if (!this.client) return false;
    
    try {
      const pong = await this.client.ping();
      this.logger.debug(`Réponse ping: ${pong}`);
      
      return pong === 'PONG';
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification de santé: ${error.message}`);
      return false;
    }
  }

  private async initializeCluster() {
    try {
      const nodes = this.getDefaultNodes();
      const password = this.configService.get<string>('REDIS_PASSWORD', 'sl3_redis_password');

      const clusterOptions: ClusterOptions = {
        redisOptions: {
          password,
          showFriendlyErrorStack: true,
          enableReadyCheck: true,
          maxRetriesPerRequest: 3,
        },
        clusterRetryStrategy: (times: number) => {
          const delay = Math.min(100 + times * 100, 2000);
          this.logger.debug(`Tentative de reconnexion au cluster (${times}), délai: ${delay}ms`);
          return delay;
        },
        enableOfflineQueue: true,
      };

      this.connectionPromise = new Promise((resolve, reject) => {
        this.client = new Cluster(nodes, clusterOptions);

        this.client.on('connect', () => {
          this.logger.log('Connecté au cluster Redis');
          resolve();
        });

        this.client.on('error', (error) => {
          this.logger.error(`Erreur Redis: ${error.message}`);
          if (!this.isInitialized) {
            reject(error);
          }
        });

        this.client.on('node error', (error, node) => {
          this.logger.error(`Erreur sur le nœud ${node.options.host}:${node.options.port}: ${error.message}`);
        });

        this.client.on('close', () => {
          this.logger.warn('Connexion Redis fermée');
        });
      });

      await this.connectionPromise;
      const isHealthy = await this.checkClusterHealth();
      
      if (!isHealthy) {
        throw new Error('Le cluster n\'est pas en bonne santé après l\'initialisation');
      }

      this.logger.log('Cluster Redis initialisé avec succès');
    } catch (error) {
      this.logger.error(`Erreur lors de l'initialisation du cluster: ${error.message}`);
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        this.logger.warn(`Nouvelle tentative (${this.retryCount}/${this.maxRetries}) dans 5 secondes...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        return this.initializeCluster();
      }
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      this.logger.log('Fermeture de la connexion Redis');
      await this.client.quit();
      this.client = null;
      this.isInitialized = false;
    }
  }

  async cleanup(): Promise<void> {
    await this.onModuleDestroy();
  }
}
