import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const redisConfig: CacheModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    store: require('cache-manager-redis-store'),
    host: configService.get('REDIS_HOST'),
    port: configService.get('REDIS_PORT'),
    ttl: 60 * 60, // 1 heure
    max: 100,
  }),
  inject: [ConfigService],
};

export const redisSocketConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
};
