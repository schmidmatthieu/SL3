import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REDIS_MODES, RedisMode } from '../constants/redis.constants';
import { IRedisService } from '../interfaces/redis.interface';
import { RedisClusterService } from './redis-cluster.service';
import { RedisStandaloneService } from './redis-standalone.service';

@Injectable()
export class RedisFactoryService {
  private readonly logger = new Logger(RedisFactoryService.name);
  private services: Map<RedisMode, IRedisService> = new Map();

  constructor(private configService: ConfigService) {}

  create(mode: RedisMode): IRedisService {
    this.logger.log(`Création du service Redis en mode: ${mode}`);

    // Réutiliser l'instance existante si elle existe
    if (this.services.has(mode)) {
      return this.services.get(mode);
    }

    let service: IRedisService;
    switch (mode) {
      case REDIS_MODES.CLUSTER:
        service = new RedisClusterService(this.configService);
        break;
      case REDIS_MODES.STANDALONE:
        service = new RedisStandaloneService(this.configService);
        break;
      default:
        throw new Error(`Mode Redis non supporté: ${mode}`);
    }

    this.services.set(mode, service);
    return service;
  }
}
