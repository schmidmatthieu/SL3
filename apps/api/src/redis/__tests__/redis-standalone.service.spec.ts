import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisStandaloneService } from '../services/redis-standalone.service';
import Redis from 'ioredis';

jest.mock('ioredis');

describe('RedisStandaloneService', () => {
  let service: RedisStandaloneService;
  let configService: ConfigService;
  let redisMock: jest.Mocked<Redis>;

  beforeEach(async () => {
    // Configuration du mock Redis
    redisMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      expire: jest.fn(),
      mget: jest.fn(),
      mset: jest.fn(),
      incr: jest.fn(),
      decr: jest.fn(),
      sadd: jest.fn(),
      smembers: jest.fn(),
      srem: jest.fn(),
      ping: jest.fn(),
      quit: jest.fn(),
      on: jest.fn(),
      duplicate: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<Redis>;

    (Redis as jest.MockedClass<typeof Redis>).mockImplementation(() => redisMock);

    // Configuration du mock ConfigService
    const configServiceMock = {
      get: jest.fn((key: string) => {
        const config = {
          REDIS_HOST: 'localhost',
          REDIS_PORT: '6379',
          REDIS_PASSWORD: 'test_password',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisStandaloneService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get<RedisStandaloneService>(RedisStandaloneService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with correct config', () => {
      expect(Redis).toHaveBeenCalledWith(expect.objectContaining({
        host: 'localhost',
        port: 6379,
        password: 'test_password',
      }));
    });

    it('should setup event listeners', () => {
      expect(redisMock.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(redisMock.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(redisMock.on).toHaveBeenCalledWith('ready', expect.any(Function));
      expect(redisMock.on).toHaveBeenCalledWith('reconnecting', expect.any(Function));
    });
  });

  describe('get', () => {
    it('should get value from redis', async () => {
      const key = 'test-key';
      const value = 'test-value';
      redisMock.get.mockResolvedValue(value);

      const result = await service.get(key);

      expect(result).toBe(value);
      expect(redisMock.get).toHaveBeenCalledWith(key);
    });

    it('should return null when key does not exist', async () => {
      redisMock.get.mockResolvedValue(null);

      const result = await service.get('non-existent-key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value without TTL', async () => {
      const key = 'test-key';
      const value = 'test-value';
      redisMock.set.mockResolvedValue('OK');

      await service.set(key, value);

      expect(redisMock.set).toHaveBeenCalledWith(key, value);
    });

    it('should set value with TTL', async () => {
      const key = 'test-key';
      const value = 'test-value';
      const ttl = 3600;
      redisMock.set.mockResolvedValue('OK');

      await service.set(key, value, ttl);

      expect(redisMock.set).toHaveBeenCalledWith(key, value, 'EX', ttl);
    });
  });

  describe('del', () => {
    it('should delete keys', async () => {
      const keys = ['key1', 'key2'];
      redisMock.del.mockResolvedValue(2);

      const result = await service.del(...keys);

      expect(result).toBe(2);
      expect(redisMock.del).toHaveBeenCalledWith(...keys);
    });
  });

  describe('exists', () => {
    it('should return true when key exists', async () => {
      redisMock.exists.mockResolvedValue(1);

      const result = await service.exists('test-key');

      expect(result).toBe(true);
    });

    it('should return false when key does not exist', async () => {
      redisMock.exists.mockResolvedValue(0);

      const result = await service.exists('non-existent-key');

      expect(result).toBe(false);
    });
  });

  describe('ping', () => {
    it('should return true when ping succeeds', async () => {
      redisMock.ping.mockResolvedValue('PONG');

      const result = await service.ping();

      expect(result).toBe(true);
    });

    it('should return false when ping fails', async () => {
      redisMock.ping.mockRejectedValue(new Error('Connection failed'));

      const result = await service.ping();

      expect(result).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should quit redis connection', async () => {
      redisMock.quit.mockResolvedValue('OK');

      await service.cleanup();

      expect(redisMock.quit).toHaveBeenCalled();
    });
  });
});
