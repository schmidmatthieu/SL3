import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisFactoryService } from '../services/redis-factory.service';
import { RedisClusterService } from '../services/redis-cluster.service';
import { RedisStandaloneService } from '../services/redis-standalone.service';
import { REDIS_MODES } from '../constants/redis.constants';

jest.mock('../services/redis-cluster.service');
jest.mock('../services/redis-standalone.service');

describe('RedisFactoryService', () => {
  let service: RedisFactoryService;
  let configService: ConfigService;

  beforeEach(async () => {
    const configServiceMock = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisFactoryService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get<RedisFactoryService>(RedisFactoryService);
    configService = module.get<ConfigService>(ConfigService);

    // Reset les mocks après chaque test
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create RedisStandaloneService when mode is standalone', () => {
      const result = service.create(REDIS_MODES.STANDALONE);

      expect(result).toBeInstanceOf(RedisStandaloneService);
      expect(RedisStandaloneService).toHaveBeenCalledWith(configService);
    });

    it('should create RedisClusterService when mode is cluster', () => {
      const result = service.create(REDIS_MODES.CLUSTER);

      expect(result).toBeInstanceOf(RedisClusterService);
      expect(RedisClusterService).toHaveBeenCalledWith(configService);
    });

    it('should throw error for invalid mode', () => {
      expect(() => {
        service.create('invalid' as any);
      }).toThrow('Mode Redis non supporté: invalid');
    });
  });
});
