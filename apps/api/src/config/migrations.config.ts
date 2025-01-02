import { Connection } from 'mongoose';
import { Logger } from '@nestjs/common';

const logger = new Logger('Migrations');

export interface Migration {
  up: (connection: Connection) => Promise<void>;
  down: (connection: Connection) => Promise<void>;
}

export async function runMigration(
  connection: Connection,
  migration: Migration,
  direction: 'up' | 'down',
) {
  try {
    logger.log(`Running migration ${direction}`);
    await migration[direction](connection);
    logger.log('Migration completed successfully');
  } catch (error) {
    logger.error(`Migration failed: ${error.message}`);
    throw error;
  }
}
