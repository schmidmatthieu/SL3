import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { runMigration } from '../config/migrations.config';
import * as mergeUsersProfiles from '../migrations/1703001387-merge-users-profiles';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const connection = app.get<Connection>(getConnectionToken());

  const direction = process.argv[2] as 'up' | 'down';
  if (!direction || !['up', 'down'].includes(direction)) {
    console.error('Please specify migration direction: up or down');
    process.exit(1);
  }

  try {
    await runMigration(connection, mergeUsersProfiles, direction);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  await app.close();
  process.exit(0);
}

bootstrap();
