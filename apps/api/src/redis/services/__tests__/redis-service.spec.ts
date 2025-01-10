import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisStandaloneService } from '../redis-standalone.service';
import { RedisClusterService } from '../redis-cluster.service';
import { IRedisService } from '../../interfaces/redis.interface';
import { REDIS_CONFIG } from '../../constants/redis.constants';

describe('Redis Services', () => {
  let moduleRef: TestingModule;
  let configService: ConfigService;
  let standaloneService: RedisStandaloneService;
  let clusterService: RedisClusterService;

  const mockClusterNodes = [
    { host: 'localhost', port: 6379 },
    { host: 'localhost', port: 6380 },
    { host: 'localhost', port: 6381 }
  ];

  const mockClusterOptions = {
    scaleReads: 'slave',
    maxRedirections: 16,
    retryDelayOnFailover: 2000,
    retryDelayOnClusterDown: 2000,
    enableOfflineQueue: true,
    slotsRefreshTimeout: 10000,
    natMap: {
      'localhost:6379': { host: 'localhost', port: 16379 },
      'localhost:6380': { host: 'localhost', port: 16380 },
      'localhost:6381': { host: 'localhost', port: 16381 }
    }
  };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        RedisStandaloneService,
        RedisClusterService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'REDIS_HOST':
                  return 'localhost';
                case 'REDIS_PORT':
                  return '6379';
                case 'REDIS_PASSWORD':
                  return 'sl3_redis_password';
                case 'REDIS_CLUSTER_RETRY_DELAY':
                  return 2000;
                case 'REDIS_CLUSTER_MAX_RETRIES':
                  return 3;
                case 'REDIS_CLUSTER_NODES':
                  return JSON.stringify(mockClusterNodes);
                case 'REDIS_CLUSTER_OPTIONS':
                  return JSON.stringify(mockClusterOptions);
                case 'REDIS_OPTIONS':
                  return JSON.stringify({
                    password: 'sl3_redis_password',
                    connectTimeout: 15000,
                    commandTimeout: 10000,
                    autoResubscribe: true,
                    enableReadyCheck: true,
                    maxRetriesPerRequest: 3,
                    showFriendlyErrorStack: true
                  });
                default:
                  return undefined;
              }
            }),
          },
        },
      ],
    }).compile();

    configService = moduleRef.get<ConfigService>(ConfigService);
    standaloneService = moduleRef.get<RedisStandaloneService>(RedisStandaloneService);
    clusterService = moduleRef.get<RedisClusterService>(RedisClusterService);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  describe('Common Redis Service Interface', () => {
    const services: IRedisService[] = [];

    beforeEach(() => {
      services.push(standaloneService);
      services.push(clusterService);
    });

    it.each(services)('should implement onModuleInit', async (service) => {
      const spy = jest.spyOn(service, 'onModuleInit');
      await service.onModuleInit();
      expect(spy).toHaveBeenCalled();
    });

    it.each(services)('should implement waitForConnection with retries', async (service) => {
      const spy = jest.spyOn(service, 'waitForConnection');
      const mockClient = {
        status: 'ready',
        on: jest.fn(),
        disconnect: jest.fn(),
      };
      
      jest.spyOn(service as any, 'getClient').mockReturnValue(mockClient);
      
      await service.waitForConnection();
      expect(spy).toHaveBeenCalled();
    });

    it.each(services)('should handle connection failures gracefully', async (service) => {
      const mockClient = {
        status: 'connecting',
        on: jest.fn((event, callback) => {
          if (event === 'error') {
            callback(new Error('Connection failed'));
          }
        }),
        disconnect: jest.fn(),
      };
      
      jest.spyOn(service as any, 'getClient').mockReturnValue(mockClient);
      
      await expect(service.waitForConnection()).rejects.toThrow('Connection failed');
    });
  });

  describe('RedisClusterService', () => {
    it('should initialize with correct cluster configuration', () => {
      const client = clusterService.getClient();
      expect(client).toBeDefined();
      
      const options = (clusterService as any).options;
      expect(options.natMap).toEqual(mockClusterOptions.natMap);
      expect(options.retryDelayOnFailover).toBe(2000);
      expect(options.retryDelayOnClusterDown).toBe(2000);
    });

    it('should handle cluster node failures', async () => {
      const mockClusterClient = {
        status: 'ready',
        on: jest.fn(),
        disconnect: jest.fn(),
        nodes: jest.fn(() => [
          { options: { host: 'localhost', port: 6379 } },
          { options: { host: 'localhost', port: 6380 } },
          { options: { host: 'localhost', port: 6381 } }
        ])
      };

      jest.spyOn(clusterService as any, 'getClient').mockReturnValue(mockClusterClient);
      
      await clusterService.waitForConnection();
      expect(mockClusterClient.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockClusterClient.on).toHaveBeenCalledWith('ready', expect.any(Function));
    });
  });
});
