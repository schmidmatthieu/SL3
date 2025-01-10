import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cluster, ClusterNode, ClusterOptions } from 'ioredis';
import { REDIS_CONFIG } from '../constants/redis.constants';
import { IRedisService } from '../interfaces/redis.interface';

@Injectable()
export class RedisClusterService implements IRedisService, OnModuleDestroy, OnModuleInit {
  private readonly logger = new Logger(RedisClusterService.name);
  private client: Cluster | null = null;
  private isInitialized = false;

  constructor(private configService: ConfigService) {
    this.initialize();
  }

  private getDefaultNodes(): ClusterNode[] {
    const nodes = this.configService.get<string>('REDIS_CLUSTER_NODES', '');
    if (!nodes) {
      return [
        { host: 'localhost', port: 6379 },
        { host: 'localhost', port: 6380 },
        { host: 'localhost', port: 6381 }
      ];
    }

    return nodes.split(',').map(node => {
      const [host, port] = node.split(':');
      return { host, port: parseInt(port, 10) };
    });
  }

  private initialize(): void {
    try {
      const nodes = this.getDefaultNodes();
      const password = this.configService.get<string>('REDIS_PASSWORD');
      const retryDelay = this.configService.get<number>('REDIS_CLUSTER_RETRY_DELAY', REDIS_CONFIG.RETRY_DELAY);
      const maxRetries = this.configService.get<number>('REDIS_CLUSTER_MAX_RETRIES', REDIS_CONFIG.MAX_RETRIES);

      this.logger.debug(`Initialisation du cluster Redis avec ${nodes.length} nœuds`);
      
      const options: ClusterOptions = {
        redisOptions: {
          password,
          connectTimeout: REDIS_CONFIG.CONNECT_TIMEOUT,
          commandTimeout: REDIS_CONFIG.COMMAND_TIMEOUT,
          autoResubscribe: true,
          enableReadyCheck: true,
          maxRetriesPerRequest: 3,
          showFriendlyErrorStack: true
        },
        clusterRetryStrategy: (times) => {
          this.logger.debug(`Tentative de reconnexion au cluster ${times}`);
          if (times >= maxRetries) {
            this.logger.error(`Échec après ${times} tentatives`);
            return null; // Arrêter les tentatives
          }
          return Math.min(times * retryDelay, 2000);
        },
        scaleReads: 'slave',
        maxRedirections: 16,
        retryDelayOnFailover: 1000,
        retryDelayOnClusterDown: 1000,
        enableOfflineQueue: true,
        slotsRefreshTimeout: REDIS_CONFIG.SLOTS_REFRESH_TIMEOUT,
        natMap: {
          'localhost:6379': { host: '172.21.0.5', port: 6379 },
          'localhost:6380': { host: '172.21.0.2', port: 6380 },
          'localhost:6381': { host: '172.21.0.4', port: 6381 }
        }
      };

      this.client = new Cluster(nodes, options);

      this.setupEventListeners();
      this.isInitialized = true;
    } catch (error) {
      this.logger.error(`Erreur d'initialisation du cluster Redis: ${error.message}`);
      throw error;
    }
  }

  private setupEventListeners(): void {
    if (!this.client) return;

    this.client.on('error', (err) => {
      this.logger.error(`Erreur Redis: ${err.message}`);
      if (err.message.includes('CLUSTERDOWN')) {
        this.logger.error('Le cluster Redis n\'est pas disponible');
      }
    });

    this.client.on('connect', () => {
      this.logger.log('Connecté au cluster Redis');
    });

    this.client.on('ready', () => {
      this.logger.log('Cluster Redis prêt');
    });

    this.client.on('node error', (err, node) => {
      this.logger.error(`Erreur nœud Redis ${node?.options?.host}:${node?.options?.port}: ${err.message}`);
    });

    this.client.on('reconnecting', () => {
      this.logger.debug('Tentative de reconnexion au cluster Redis...');
    });
  }

  public getClient(): Cluster {
    if (!this.client || !this.isInitialized) {
      throw new Error('Le client Redis n\'est pas initialisé');
    }
    return this.client;
  }

  async onModuleInit(): Promise<void> {
    this.logger.debug('Initialisation du cluster Redis avec 3 nœuds');
    await this.waitForConnection();
  }

  async waitForConnection(): Promise<void> {
    if (this.client && this.client.status === 'ready') {
      this.logger.log('Client Redis déjà connecté');
      return;
    }

    let retries = 0;
    const maxRetries = 3;
    const retryDelay = 2000;

    return new Promise((resolve, reject) => {
      const tryConnect = () => {
        if (retries >= maxRetries) {
          reject(new Error(`Échec de connexion après ${maxRetries} tentatives`));
          return;
        }

        this.logger.debug(`Tentative de reconnexion au cluster ${retries + 1}`);

        if (!this.client) {
          this.initializeClient();
        }

        this.client.on('ready', () => {
          this.logger.log('Connecté au cluster Redis');
          resolve();
        });

        this.client.on('error', (error) => {
          this.logger.error(`Erreur de connexion: ${error.message}`);
          retries++;
          setTimeout(tryConnect, retryDelay);
        });
      };

      tryConnect();
    });
  }

  private initializeClient(): void {
    const nodes = this.getDefaultNodes();
    const password = this.configService.get<string>('REDIS_PASSWORD');
    const retryDelay = this.configService.get<number>('REDIS_CLUSTER_RETRY_DELAY', REDIS_CONFIG.RETRY_DELAY);
    const maxRetries = this.configService.get<number>('REDIS_CLUSTER_MAX_RETRIES', REDIS_CONFIG.MAX_RETRIES);

    const options: ClusterOptions = {
      redisOptions: {
        password,
        connectTimeout: REDIS_CONFIG.CONNECT_TIMEOUT,
        commandTimeout: REDIS_CONFIG.COMMAND_TIMEOUT,
        autoResubscribe: true,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        showFriendlyErrorStack: true
      },
      clusterRetryStrategy: (times) => {
        this.logger.debug(`Tentative de reconnexion au cluster ${times}`);
        if (times >= maxRetries) {
          this.logger.error(`Échec après ${times} tentatives`);
          return null; // Arrêter les tentatives
        }
        return Math.min(times * retryDelay, 2000);
      },
      scaleReads: 'slave',
      maxRedirections: 16,
      retryDelayOnFailover: 1000,
      retryDelayOnClusterDown: 1000,
      enableOfflineQueue: true,
      slotsRefreshTimeout: REDIS_CONFIG.SLOTS_REFRESH_TIMEOUT,
      natMap: {
        'localhost:6379': { host: '172.21.0.5', port: 6379 },
        'localhost:6380': { host: '172.21.0.2', port: 6380 },
        'localhost:6381': { host: '172.21.0.4', port: 6381 }
      }
    };

    this.client = new Cluster(nodes, options);
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
