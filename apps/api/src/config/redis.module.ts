import { Module, Global } from '@nestjs/common';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (configService: ConfigService) => {
        const client = createClient({
          url: configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
          password: configService.get<string>('REDIS_PASSWORD'),
        });

        await client.connect();

        client.on('error', (err) => console.error('Redis Client Error', err));
        client.on('connect', () => console.log('Connected to Redis'));

        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
