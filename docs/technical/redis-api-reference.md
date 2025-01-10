# Documentation API Redis

## Table des Matières
1. [Services](#services)
2. [Interfaces](#interfaces)
3. [Constants](#constants)
4. [Types](#types)
5. [Modules](#modules)

## Services

### RedisFactoryService

Service responsable de la création des instances Redis selon le mode configuré.

```typescript
class RedisFactoryService {
  /**
   * Crée une instance du service Redis approprié
   * @param mode - Mode Redis ('standalone' ou 'cluster')
   * @returns Instance IRedisService
   * @throws Error si le mode n'est pas supporté
   */
  create(mode: RedisMode): IRedisService;
}
```

### RedisStandaloneService

Service pour la gestion des opérations Redis en mode standalone.

```typescript
class RedisStandaloneService implements IRedisService {
  /**
   * Initialise la connexion Redis
   * @throws Error si la connexion échoue
   */
  private initialize(): void;

  // Implémente toutes les méthodes de IRedisService
}
```

### RedisClusterService

Service pour la gestion des opérations Redis en mode cluster.

```typescript
class RedisClusterService implements IRedisService {
  /**
   * Initialise la connexion au cluster Redis
   * @throws Error si la connexion échoue
   */
  private initialize(): void;

  // Implémente toutes les méthodes de IRedisService
}
```

## Interfaces

### IRedisService

Interface principale pour les opérations Redis.

```typescript
interface IRedisService {
  /**
   * Récupère une valeur par sa clé
   * @param key - Clé Redis
   * @returns Valeur associée ou null si non trouvée
   */
  get(key: string): Promise<string | null>;

  /**
   * Stocke une valeur avec une clé optionnelle
   * @param key - Clé Redis
   * @param value - Valeur à stocker
   * @param ttl - Durée de vie en secondes (optionnel)
   */
  set(key: string, value: string, ttl?: number): Promise<void>;

  /**
   * Supprime une ou plusieurs clés
   * @param keys - Liste des clés à supprimer
   * @returns Nombre de clés supprimées
   */
  del(...keys: string[]): Promise<number>;

  /**
   * Vérifie l'existence d'une clé
   * @param key - Clé à vérifier
   * @returns true si la clé existe
   */
  exists(key: string): Promise<boolean>;

  /**
   * Définit un TTL sur une clé
   * @param key - Clé à modifier
   * @param ttl - Durée de vie en secondes
   * @returns true si le TTL a été défini
   */
  expire(key: string, ttl: number): Promise<boolean>;

  /**
   * Récupère plusieurs valeurs en une fois
   * @param keys - Liste des clés
   * @returns Liste des valeurs (null pour les clés non trouvées)
   */
  mget(keys: string[]): Promise<(string | null)[]>;

  /**
   * Stocke plusieurs valeurs en une fois
   * @param keyValueMap - Map clé-valeur
   */
  mset(keyValueMap: Record<string, string>): Promise<void>;

  /**
   * Incrémente une valeur numérique
   * @param key - Clé à incrémenter
   * @returns Nouvelle valeur
   */
  incr(key: string): Promise<number>;

  /**
   * Décrémente une valeur numérique
   * @param key - Clé à décrémenter
   * @returns Nouvelle valeur
   */
  decr(key: string): Promise<number>;

  /**
   * Ajoute des membres à un set
   * @param key - Clé du set
   * @param members - Membres à ajouter
   * @returns Nombre de membres ajoutés
   */
  sadd(key: string, ...members: string[]): Promise<number>;

  /**
   * Récupère tous les membres d'un set
   * @param key - Clé du set
   * @returns Liste des membres
   */
  smembers(key: string): Promise<string[]>;

  /**
   * Supprime des membres d'un set
   * @param key - Clé du set
   * @param members - Membres à supprimer
   * @returns Nombre de membres supprimés
   */
  srem(key: string, ...members: string[]): Promise<number>;

  /**
   * Vérifie la connexion au serveur Redis
   * @returns true si la connexion est active
   */
  ping(): Promise<boolean>;

  /**
   * Nettoie les ressources
   */
  cleanup(): Promise<void>;
}
```

## Constants

### REDIS_PROVIDER

Token d'injection pour le service Redis.

```typescript
export const REDIS_PROVIDER = 'REDIS_SERVICE';
```

### REDIS_MODES

Modes de fonctionnement Redis disponibles.

```typescript
export const REDIS_MODES = {
  STANDALONE: 'standalone',
  CLUSTER: 'cluster',
} as const;
```

### REDIS_CONFIG

Configuration par défaut.

```typescript
export const REDIS_CONFIG = {
  DEFAULT_PORT: 6379,
  CONNECT_TIMEOUT: 10000,
  COMMAND_TIMEOUT: 5000,
  RETRY_DELAY: 100,
  MAX_RETRIES: 5,
  SLOTS_REFRESH_TIMEOUT: 2000,
} as const;
```

## Types

### RedisMode

Type pour les modes Redis supportés.

```typescript
export type RedisMode = typeof REDIS_MODES[keyof typeof REDIS_MODES];
```

## Modules

### RedisModule

Module principal pour l'intégration Redis.

```typescript
class RedisModule {
  /**
   * Configuration globale du module Redis
   * @returns Configuration du module
   */
  static forRoot(): DynamicModule;

  /**
   * Configuration pour un feature module
   * @returns Configuration du module
   */
  static forFeature(): DynamicModule;
}
```

## Exemples d'Utilisation

### Configuration Basique

```typescript
// app.module.ts
@Module({
  imports: [
    RedisModule.forRoot(),
  ],
})
export class AppModule {}
```

### Utilisation dans un Service

```typescript
@Injectable()
export class CacheService {
  constructor(
    @Inject(REDIS_PROVIDER)
    private readonly redisService: IRedisService,
  ) {}

  async cacheData(key: string, data: string): Promise<void> {
    await this.redisService.set(key, data, 3600);
  }
}
```
