import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '../redis.module';
import { REDIS_PROVIDER } from '../constants/redis.constants';
import { IRedisService } from '../interfaces/redis.interface';
import { RedisStandaloneService } from '../services/redis-standalone.service';
import { RedisClusterService } from '../services/redis-cluster.service';

describe('RedisModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => ({
            REDIS_MODE: 'standalone',
            REDIS_HOST: 'localhost',
            REDIS_PORT: 6379,
            REDIS_PASSWORD: 'test_password',
          })],
        }),
        RedisModule.forRoot(),
      ],
    }).compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('forRoot', () => {
    it('should provide RedisService', () => {
      const redisService = module.get<IRedisService>(REDIS_PROVIDER);
      expect(redisService).toBeDefined();
    });

    it('should be global module', () => {
      const moduleRef = module.get(RedisModule);
      expect(moduleRef).toBeDefined();
    });

    it('should provide standalone service when mode is standalone', async () => {
      const module = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            load: [() => ({ REDIS_MODE: 'standalone' })],
          }),
          RedisModule.forRoot(),
        ],
      }).compile();

      const service = module.get(REDIS_PROVIDER);
      expect(service).toBeInstanceOf(RedisStandaloneService);
    });

    it('should provide cluster service when mode is cluster', async () => {
      const module = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            load: [() => ({ REDIS_MODE: 'cluster' })],
          }),
          RedisModule.forRoot(),
        ],
      }).compile();

      const service = module.get(REDIS_PROVIDER);
      expect(service).toBeInstanceOf(RedisClusterService);
    });

    it('should default to standalone mode when no mode is specified', async () => {
      const module = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot(),
          RedisModule.forRoot(),
        ],
      }).compile();

      const service = module.get(REDIS_PROVIDER);
      expect(service).toBeInstanceOf(RedisStandaloneService);
    });

    it('should reuse existing service instance', async () => {
      const module = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            load: [() => ({ REDIS_MODE: 'standalone' })],
          }),
          RedisModule.forRoot(),
        ],
      }).compile();

      const service1 = module.get(REDIS_PROVIDER);
      const service2 = module.get(REDIS_PROVIDER);
      expect(service1).toBe(service2);
    });
  });

  describe('forFeature', () => {
    let featureModule: TestingModule;

    beforeEach(async () => {
      featureModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [() => ({
              REDIS_MODE: 'standalone',
              REDIS_HOST: 'localhost',
              REDIS_PORT: 6379,
              REDIS_PASSWORD: 'test_password',
            })],
          }),
          RedisModule.forRoot(),
          RedisModule.forFeature(),
        ],
      }).compile();
    });

    afterEach(async () => {
      if (featureModule) {
        await featureModule.close();
      }
    });

    it('should provide RedisService in feature module', () => {
      const redisService = featureModule.get<IRedisService>(REDIS_PROVIDER);
      expect(redisService).toBeDefined();
    });

    it('should share the same instance of RedisService', () => {
      const rootRedisService = module.get<IRedisService>(REDIS_PROVIDER);
      const featureRedisService = featureModule.get<IRedisService>(REDIS_PROVIDER);
      expect(rootRedisService).toBe(featureRedisService);
    });
  });

  describe('error handling', () => {
    it('should throw error when redis connection fails', async () => {
      const mockConfig = {
        REDIS_MODE: 'standalone',
        REDIS_HOST: 'invalid-host',
        REDIS_PORT: 6379,
        REDIS_PASSWORD: 'test_password',
      };

      await expect(
        Test.createTestingModule({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
              load: [() => mockConfig],
            }),
            RedisModule.forRoot(),
          ],
        }).compile(),
      ).rejects.toThrow();
    });
  });
});
