# Guide d'Utilisation Redis

## Table des Matières
1. [Introduction](#introduction)
2. [Configuration](#configuration)
3. [Utilisation de Base](#utilisation-de-base)
4. [Modes de Fonctionnement](#modes-de-fonctionnement)
5. [Bonnes Pratiques](#bonnes-pratiques)
6. [Dépannage](#dépannage)

## Introduction

Notre implémentation Redis fournit une interface unifiée pour interagir avec Redis, que ce soit en mode standalone ou cluster. Elle est conçue pour être :
- Facile à utiliser
- Hautement configurable
- Résiliente aux erreurs
- Compatible avec les tests

## Configuration

### Variables d'Environnement

```env
# Mode Redis (standalone ou cluster)
REDIS_MODE=standalone

# Configuration Standalone
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password

# Configuration Cluster
REDIS_CLUSTER_NODES=localhost:6379,localhost:6380,localhost:6381
REDIS_CLUSTER_RETRY_DELAY=100
REDIS_CLUSTER_MAX_RETRIES=5
```

### Configuration du Module

```typescript
// Dans app.module.ts
import { RedisModule } from './redis';

@Module({
  imports: [
    RedisModule.forRoot(),
    // ...
  ],
})
export class AppModule {}

// Dans un feature module
@Module({
  imports: [
    RedisModule.forFeature(),
    // ...
  ],
})
export class FeatureModule {}
```

## Utilisation de Base

### Injection du Service

```typescript
import { Injectable } from '@nestjs/common';
import { IRedisService, REDIS_PROVIDER } from './redis';

@Injectable()
export class YourService {
  constructor(
    @Inject(REDIS_PROVIDER)
    private readonly redisService: IRedisService,
  ) {}
}
```

### Opérations CRUD

```typescript
// Stockage de données
await redisService.set('key', 'value');
await redisService.set('key-with-ttl', 'value', 3600); // TTL en secondes

// Récupération de données
const value = await redisService.get('key');

// Suppression de données
await redisService.del('key');

// Vérification d'existence
const exists = await redisService.exists('key');
```

### Opérations sur les Sets

```typescript
// Ajout de membres
await redisService.sadd('set-key', 'member1', 'member2');

// Récupération des membres
const members = await redisService.smembers('set-key');

// Suppression de membres
await redisService.srem('set-key', 'member1');
```

### Opérations Multiples

```typescript
// Multi-get
const values = await redisService.mget(['key1', 'key2']);

// Multi-set
await redisService.mset({
  key1: 'value1',
  key2: 'value2',
});
```

## Modes de Fonctionnement

### Mode Standalone

Le mode standalone est recommandé pour :
- Développement local
- Tests
- Applications avec des besoins simples en cache

Configuration minimale :
```env
REDIS_MODE=standalone
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Mode Cluster

Le mode cluster est recommandé pour :
- Production
- Applications à haute disponibilité
- Besoins en scalabilité horizontale

Configuration minimale :
```env
REDIS_MODE=cluster
REDIS_CLUSTER_NODES=host1:port1,host2:port2,host3:port3
```

## Bonnes Pratiques

1. **Gestion des Erreurs**
   ```typescript
   try {
     await redisService.set('key', 'value');
   } catch (error) {
     // Gérer l'erreur de manière appropriée
     logger.error('Erreur Redis:', error.message);
   }
   ```

2. **Vérification de la Connexion**
   ```typescript
   const isConnected = await redisService.ping();
   if (!isConnected) {
     // Gérer la déconnexion
   }
   ```

3. **Utilisation des TTL**
   ```typescript
   // Toujours définir un TTL pour éviter l'accumulation de données
   await redisService.set('temporary-key', 'value', 3600);
   ```

4. **Nommage des Clés**
   ```typescript
   // Utiliser des préfixes pour organiser les clés
   const keyPrefix = 'user:';
   await redisService.set(`${keyPrefix}${userId}`, userData);
   ```

## Dépannage

### Problèmes Courants

1. **Erreur de Connexion**
   - Vérifier les variables d'environnement
   - Vérifier que Redis est en cours d'exécution
   - Vérifier les logs pour plus de détails

2. **Timeout**
   - Augmenter REDIS_CLUSTER_RETRY_DELAY
   - Vérifier la charge du serveur
   - Vérifier la connexion réseau

3. **Perte de Données**
   - Vérifier la configuration de persistance Redis
   - Vérifier les TTL configurés
   - Vérifier les logs d'erreurs

### Logs et Monitoring

```typescript
// Activer les logs détaillés
const logger = new Logger('RedisService');
logger.debug('Opération Redis détaillée');

// Monitoring de la santé
const health = await redisService.ping();
logger.log(`État Redis: ${health ? 'OK' : 'KO'}`);
```

### Support

Pour plus d'aide :
1. Consulter les logs de l'application
2. Vérifier la documentation Redis officielle
3. Ouvrir une issue sur le dépôt du projet
4. Contacter l'équipe DevOps
