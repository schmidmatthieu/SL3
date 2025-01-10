import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '../../redis.module';
import { REDIS_PROVIDER } from '../../constants/redis.constants';
import { IRedisService } from '../../interfaces/redis.interface';

describe('Redis Mode Switch Integration', () => {
  let moduleRef: TestingModule;
  let redisService: IRedisService;
  let configService: ConfigService;

  const testData = {
    key: 'test-integration-key',
    value: 'test-integration-value',
  };

  const cleanupRedis = async (service: IRedisService) => {
    try {
      await service.del(testData.key);
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    }
  };

  describe('Standalone Mode', () => {
    beforeAll(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [
              () => ({
                REDIS_MODE: 'standalone',
                REDIS_HOST: 'localhost',
                REDIS_PORT: 6379,
                REDIS_PASSWORD: 'sl3_redis_password',
              }),
            ],
          }),
          RedisModule.forRoot(),
        ],
      }).compile();

      redisService = moduleRef.get<IRedisService>(REDIS_PROVIDER);
      configService = moduleRef.get<ConfigService>(ConfigService);

      // Attendre que la connexion soit établie
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    afterAll(async () => {
      await cleanupRedis(redisService);
      await moduleRef.close();
    });

    it('should connect to Redis in standalone mode', async () => {
      const isConnected = await redisService.ping();
      expect(isConnected).toBe(true);
    });

    it('should perform basic CRUD operations', async () => {
      // Set
      await redisService.set(testData.key, testData.value);
      
      // Get
      const value = await redisService.get(testData.key);
      expect(value).toBe(testData.value);
      
      // Delete
      await redisService.del(testData.key);
      const deletedValue = await redisService.get(testData.key);
      expect(deletedValue).toBeNull();
    });

    it('should handle TTL operations', async () => {
      await redisService.set(testData.key, testData.value, 1);
      
      // Vérifier que la clé existe
      let exists = await redisService.exists(testData.key);
      expect(exists).toBe(true);
      
      // Attendre l'expiration
      await new Promise((resolve) => setTimeout(resolve, 1100));
      
      // Vérifier que la clé n'existe plus
      exists = await redisService.exists(testData.key);
      expect(exists).toBe(false);
    });
  });

  describe('Cluster Mode', () => {
    beforeAll(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [
              () => ({
                REDIS_MODE: 'cluster',
                REDIS_CLUSTER_NODES: 'localhost:6379,localhost:6380,localhost:6381',
                REDIS_PASSWORD: 'sl3_redis_password',
              }),
            ],
          }),
          RedisModule.forRoot(),
        ],
      }).compile();

      redisService = moduleRef.get<IRedisService>(REDIS_PROVIDER);
      configService = moduleRef.get<ConfigService>(ConfigService);

      // Attendre que la connexion soit établie
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    afterAll(async () => {
      await cleanupRedis(redisService);
      await moduleRef.close();
    });

    it('should connect to Redis in cluster mode', async () => {
      const isConnected = await redisService.ping();
      expect(isConnected).toBe(true);
    });

    it('should perform basic CRUD operations in cluster mode', async () => {
      // Set
      await redisService.set(testData.key, testData.value);
      
      // Get
      const value = await redisService.get(testData.key);
      expect(value).toBe(testData.value);
      
      // Delete
      await redisService.del(testData.key);
      const deletedValue = await redisService.get(testData.key);
      expect(deletedValue).toBeNull();
    });

    it('should handle set operations in cluster mode', async () => {
      const setKey = 'test-set';
      const members = ['member1', 'member2', 'member3'];
      
      // Add members
      await redisService.sadd(setKey, ...members);
      
      // Get members
      const result = await redisService.smembers(setKey);
      expect(result.sort()).toEqual(members.sort());
      
      // Remove members
      await redisService.srem(setKey, ...members);
      const emptySet = await redisService.smembers(setKey);
      expect(emptySet).toHaveLength(0);
      
      // Cleanup
      await redisService.del(setKey);
    });
  });
});
