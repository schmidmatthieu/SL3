import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '../../redis.module';
import { REDIS_PROVIDER } from '../../constants/redis.constants';
import { IRedisService } from '../../interfaces/redis.interface';

describe('Redis Performance Tests', () => {
  let moduleRef: TestingModule;
  let redisService: IRedisService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              REDIS_MODE: process.env.REDIS_MODE || 'standalone',
              REDIS_HOST: 'localhost',
              REDIS_PORT: 6379,
              REDIS_PASSWORD: 'sl3_redis_password',
              REDIS_CLUSTER_NODES: 'localhost:6379,localhost:6380,localhost:6381',
            }),
          ],
        }),
        RedisModule.forRoot(),
      ],
    }).compile();

    redisService = moduleRef.get<IRedisService>(REDIS_PROVIDER);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  const generateTestData = (size: number) => {
    return Array.from({ length: size }, (_, i) => ({
      key: `perf-test-key-${i}`,
      value: `perf-test-value-${i}-${'x'.repeat(100)}`, // Valeur de taille fixe
    }));
  };

  const cleanup = async (keys: string[]) => {
    await redisService.del(...keys);
  };

  const measureTime = async (operation: () => Promise<void>): Promise<number> => {
    const start = process.hrtime();
    await operation();
    const [seconds, nanoseconds] = process.hrtime(start);
    return seconds * 1000 + nanoseconds / 1_000_000; // Convertir en millisecondes
  };

  describe('Write Performance', () => {
    it('should handle bulk writes efficiently', async () => {
      const batchSizes = [100, 1000, 5000];
      const results: { size: number; time: number; opsPerSecond: number }[] = [];

      for (const size of batchSizes) {
        const testData = generateTestData(size);
        
        const time = await measureTime(async () => {
          await Promise.all(
            testData.map(({ key, value }) => redisService.set(key, value))
          );
        });

        const opsPerSecond = (size / time) * 1000;
        results.push({ size, time, opsPerSecond });

        // Nettoyage
        await cleanup(testData.map(({ key }) => key));

        // Attendre un peu entre les tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Log des résultats
      console.table(results);

      // Vérifications de base
      results.forEach(({ opsPerSecond }) => {
        expect(opsPerSecond).toBeGreaterThan(100); // Au moins 100 ops/sec
      });
    }, 60000);
  });

  describe('Read Performance', () => {
    it('should handle bulk reads efficiently', async () => {
      const batchSizes = [100, 1000, 5000];
      const results: { size: number; time: number; opsPerSecond: number }[] = [];

      for (const size of batchSizes) {
        const testData = generateTestData(size);
        
        // Préparer les données
        await Promise.all(
          testData.map(({ key, value }) => redisService.set(key, value))
        );

        const time = await measureTime(async () => {
          await Promise.all(
            testData.map(({ key }) => redisService.get(key))
          );
        });

        const opsPerSecond = (size / time) * 1000;
        results.push({ size, time, opsPerSecond });

        // Nettoyage
        await cleanup(testData.map(({ key }) => key));

        // Attendre un peu entre les tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Log des résultats
      console.table(results);

      // Vérifications de base
      results.forEach(({ opsPerSecond }) => {
        expect(opsPerSecond).toBeGreaterThan(200); // Au moins 200 ops/sec pour les lectures
      });
    }, 60000);
  });

  describe('Mixed Operations Performance', () => {
    it('should handle mixed operations efficiently', async () => {
      const operationCounts = [100, 500, 1000];
      const results: { count: number; time: number; opsPerSecond: number }[] = [];

      for (const count of operationCounts) {
        const testData = generateTestData(count);
        
        const time = await measureTime(async () => {
          const operations = testData.flatMap(({ key, value }) => [
            redisService.set(key, value),
            redisService.get(key),
            redisService.exists(key),
          ]);

          await Promise.all(operations);
        });

        const totalOperations = count * 3; // set + get + exists
        const opsPerSecond = (totalOperations / time) * 1000;
        results.push({ count: totalOperations, time, opsPerSecond });

        // Nettoyage
        await cleanup(testData.map(({ key }) => key));

        // Attendre un peu entre les tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Log des résultats
      console.table(results);

      // Vérifications de base
      results.forEach(({ opsPerSecond }) => {
        expect(opsPerSecond).toBeGreaterThan(150); // Au moins 150 ops/sec pour les opérations mixtes
      });
    }, 60000);
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent operations efficiently', async () => {
      const concurrencyLevels = [10, 50, 100];
      const operationsPerClient = 100;
      const results: { concurrency: number; time: number; opsPerSecond: number }[] = [];

      for (const concurrency of concurrencyLevels) {
        const clients = Array.from({ length: concurrency }, (_, i) => ({
          id: i,
          data: generateTestData(operationsPerClient),
        }));

        const time = await measureTime(async () => {
          await Promise.all(
            clients.map(async client => {
              const operations = client.data.flatMap(({ key, value }) => [
                redisService.set(`${client.id}-${key}`, value),
                redisService.get(`${client.id}-${key}`),
              ]);
              await Promise.all(operations);
            })
          );
        });

        const totalOperations = concurrency * operationsPerClient * 2; // set + get
        const opsPerSecond = (totalOperations / time) * 1000;
        results.push({ concurrency, time, opsPerSecond });

        // Nettoyage
        await Promise.all(
          clients.map(client =>
            cleanup(client.data.map(({ key }) => `${client.id}-${key}`))
          )
        );

        // Attendre un peu entre les tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Log des résultats
      console.table(results);

      // Vérifications de base
      results.forEach(({ opsPerSecond }) => {
        expect(opsPerSecond).toBeGreaterThan(100); // Au moins 100 ops/sec même avec concurrence
      });
    }, 120000);
  });
});
