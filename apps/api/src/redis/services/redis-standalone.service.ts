import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CONFIG } from '../constants/redis.constants';
import { IRedisService } from '../interfaces/redis.interface';

@Injectable()
export class RedisStandaloneService implements IRedisService, OnModuleDestroy, OnModuleInit {
  private readonly logger = new Logger(RedisStandaloneService.name);
  private client: Redis | null = null;
  private isInitialized = false;

  constructor(private configService: ConfigService) {
    this.initialize();
  }

  private initialize(): void {
    try {
      const host = this.configService.get<string>('REDIS_HOST', 'localhost');
      const port = this.configService.get<number>('REDIS_PORT', REDIS_CONFIG.DEFAULT_PORT);
      const password = this.configService.get<string>('REDIS_PASSWORD');
      const retryDelay = this.configService.get<number>('REDIS_CLUSTER_RETRY_DELAY', REDIS_CONFIG.RETRY_DELAY);
      const maxRetries = this.configService.get<number>('REDIS_CLUSTER_MAX_RETRIES', REDIS_CONFIG.MAX_RETRIES);

      this.logger.debug(`Initialisation de Redis standalone sur ${host}:${port}`);

      this.client = new Redis({
        host,
        port,
        password,
        connectTimeout: REDIS_CONFIG.CONNECT_TIMEOUT,
        commandTimeout: REDIS_CONFIG.COMMAND_TIMEOUT,
        retryStrategy: (times) => {
          this.logger.debug(`Tentative de reconnexion ${times}`);
          if (times >= maxRetries) {
            this.logger.error(`Échec après ${times} tentatives`);
            return null; // Arrêter les tentatives
          }
          const delay = Math.min(times * retryDelay, 2000);
          this.logger.debug(`Nouvelle tentative dans ${delay}ms`);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        autoResubscribe: true,
        showFriendlyErrorStack: true
      });

      this.setupEventListeners();
      this.isInitialized = true;
    } catch (error) {
      this.logger.error(`Erreur d'initialisation Redis: ${error.message}`);
      throw error;
    }
  }

  private setupEventListeners(): void {
    if (!this.client) return;

    this.client.on('error', (err) => {
      this.logger.error(`Erreur Redis: ${err.message}`);
    });

    this.client.on('connect', () => {
      this.logger.log('Connecté à Redis');
    });

    this.client.on('ready', () => {
      this.logger.log('Redis prêt');
    });

    this.client.on('reconnecting', () => {
      this.logger.debug('Tentative de reconnexion à Redis...');
    });

    this.client.on('end', () => {
      this.logger.warn('Connexion Redis terminée');
    });
  }

  public getClient(): Redis {
    if (!this.client || !this.isInitialized) {
      throw new Error('Le client Redis n\'est pas initialisé');
    }
    return this.client;
  }

  async onModuleInit(): Promise<void> {
    this.logger.debug('Initialisation de Redis standalone');
    await this.waitForConnection();
  }

  async waitForConnection(): Promise<void> {
    if (this.client && this.client.status === 'ready') return;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout en attendant la connexion Redis'));
      }, 10000);

      this.client?.once('ready', () => {
        clearTimeout(timeout);
        resolve();
      });

      this.client?.once('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  // Implémentation de l'interface IRedisService
  async get(key: string): Promise<string | null> {
    return this.getClient().get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    const client = this.getClient();
    if (ttl) {
      await client.set(key, value, 'EX', ttl);
    } else {
      await client.set(key, value);
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
    const entries = Object.entries(keyValueMap).flat();
    await this.getClient().mset(...entries);
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

  async cleanup(): Promise<void> {
    if (this.client) {
      this.logger.log('Fermeture de la connexion Redis');
      await this.client.quit();
      this.client = null;
      this.isInitialized = false;
    }
  }

  async onModuleDestroy() {
    await this.cleanup();
  }
}
