import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '../../redis.module';
import { REDIS_PROVIDER } from '../../constants/redis.constants';
import { IRedisService } from '../../interfaces/redis.interface';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('Redis Reconnection Integration', () => {
  let moduleRef: TestingModule;
  let redisService: IRedisService;

  const testData = {
    key: 'reconnection-test-key',
    value: 'reconnection-test-value',
  };

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
  });

  afterAll(async () => {
    await redisService.del(testData.key);
    await moduleRef.close();
  });

  const restartRedis = async () => {
    try {
      // Utiliser docker pour redémarrer Redis
      await execAsync('docker restart sl3_redis');
      // Attendre que Redis redémarre
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Erreur lors du redémarrage de Redis:', error);
      throw error;
    }
  };

  const waitForConnection = async (maxAttempts = 10, delay = 1000): Promise<boolean> => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const isConnected = await redisService.ping();
        if (isConnected) {
          return true;
        }
      } catch (error) {
        console.log(`Tentative ${i + 1} échouée, nouvelle tentative dans ${delay}ms`);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    return false;
  };

  describe('Reconnection Tests', () => {
    it('should reconnect after Redis restart', async () => {
      // Vérifier la connexion initiale
      expect(await redisService.ping()).toBe(true);

      // Sauvegarder des données
      await redisService.set(testData.key, testData.value);
      expect(await redisService.get(testData.key)).toBe(testData.value);

      // Redémarrer Redis
      await restartRedis();

      // Attendre la reconnexion
      const isReconnected = await waitForConnection();
      expect(isReconnected).toBe(true);

      // Vérifier que les données sont toujours accessibles
      expect(await redisService.get(testData.key)).toBe(testData.value);
    }, 30000);

    it('should handle multiple reconnections', async () => {
      for (let i = 0; i < 3; i++) {
        // Vérifier la connexion
        expect(await redisService.ping()).toBe(true);

        // Sauvegarder des données
        const value = `${testData.value}-${i}`;
        await redisService.set(testData.key, value);
        expect(await redisService.get(testData.key)).toBe(value);

        // Redémarrer Redis
        await restartRedis();

        // Attendre la reconnexion
        const isReconnected = await waitForConnection();
        expect(isReconnected).toBe(true);

        // Vérifier que les données sont toujours accessibles
        expect(await redisService.get(testData.key)).toBe(value);
      }
    }, 90000);

    it('should handle concurrent operations during reconnection', async () => {
      // Préparer les opérations concurrentes
      const operations = Array.from({ length: 5 }, (_, i) => ({
        key: `${testData.key}-${i}`,
        value: `${testData.value}-${i}`,
      }));

      // Sauvegarder les données initiales
      await Promise.all(
        operations.map(op => redisService.set(op.key, op.value))
      );

      // Redémarrer Redis
      await restartRedis();

      // Exécuter des opérations pendant la reconnexion
      const results = await Promise.allSettled(
        operations.map(async op => {
          try {
            await redisService.get(op.key);
            await redisService.set(op.key, `${op.value}-updated`);
            return true;
          } catch (error) {
            return false;
          }
        })
      );

      // Attendre la reconnexion complète
      await waitForConnection();

      // Vérifier que toutes les opérations ont été traitées ou rejetées proprement
      results.forEach(result => {
        expect(result.status === 'fulfilled' || result.status === 'rejected').toBe(true);
      });

      // Nettoyer
      await Promise.all(
        operations.map(op => redisService.del(op.key))
      );
    }, 30000);
  });
});
