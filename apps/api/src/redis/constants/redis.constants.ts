export const REDIS_MODES = {
  STANDALONE: 'standalone',
  CLUSTER: 'cluster',
} as const;

export type RedisMode = typeof REDIS_MODES[keyof typeof REDIS_MODES];

export const REDIS_PROVIDER = 'REDIS_SERVICE';

export const DEFAULT_TTL = 3600; // 1 hour in seconds

export const REDIS_CONFIG = {
  CONNECT_TIMEOUT: 10000,
  COMMAND_TIMEOUT: 5000,
  SLOTS_REFRESH_TIMEOUT: 5000,
  RETRY_DELAY: 1000,
  MAX_RETRIES: 3,
  DEFAULT_PORT: 6379,
  CLUSTER_PORTS: [6379, 6380, 6381],
} as const;
