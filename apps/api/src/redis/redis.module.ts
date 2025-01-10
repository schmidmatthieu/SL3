import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REDIS_MODES, REDIS_PROVIDER } from './constants/redis.constants';
import { IRedisService } from './interfaces/redis.interface';
import { RedisFactoryService } from './services/redis-factory.service';
import { RedisClusterService } from './services/redis-cluster.service';
import { RedisStandaloneService } from './services/redis-standalone.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    RedisFactoryService,
    {
      provide: REDIS_PROVIDER,
      useFactory: async (
        configService: ConfigService,
        factoryService: RedisFactoryService,
      ): Promise<IRedisService> => {
        const mode = configService.get<string>('REDIS_MODE', REDIS_MODES.STANDALONE);
        const service = factoryService.create(mode as 'standalone' | 'cluster');
        
        // Vérifier la connexion
        const isConnected = await service.ping();
        if (!isConnected) {
          throw new Error(`Impossible de se connecter à Redis en mode ${mode}`);
        }
        
        return service;
      },
      inject: [ConfigService, RedisFactoryService],
    },
  ],
  exports: [REDIS_PROVIDER],
})
export class RedisModule {
  static forRoot(): DynamicModule {
    const providers: Provider[] = [
      RedisFactoryService,
      {
        provide: REDIS_PROVIDER,
        useFactory: async (
          configService: ConfigService,
          factoryService: RedisFactoryService,
        ): Promise<IRedisService> => {
          const mode = configService.get<string>('REDIS_MODE', REDIS_MODES.STANDALONE);
          
          // Fournir uniquement le service nécessaire
          const providers = mode === REDIS_MODES.CLUSTER 
            ? [RedisClusterService]
            : [RedisStandaloneService];
            
          const service = factoryService.create(mode as 'standalone' | 'cluster');
          
          // Vérifier la connexion
          const isConnected = await service.ping();
          if (!isConnected) {
            throw new Error(`Impossible de se connecter à Redis en mode ${mode}`);
          }
          
          return service;
        },
        inject: [ConfigService, RedisFactoryService],
      },
    ];

    return {
      module: RedisModule,
      imports: [ConfigModule],
      providers,
      exports: [REDIS_PROVIDER],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: RedisModule,
      exports: [REDIS_PROVIDER],
    };
  }
}
