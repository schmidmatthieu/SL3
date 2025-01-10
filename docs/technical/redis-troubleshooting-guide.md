# Guide de Dépannage Redis

## Table des Matières
1. [Problèmes de Connexion](#problèmes-de-connexion)
2. [Problèmes de Performance](#problèmes-de-performance)
3. [Problèmes de Cluster](#problèmes-de-cluster)
4. [Erreurs Courantes](#erreurs-courantes)
5. [Monitoring et Logs](#monitoring-et-logs)
6. [Maintenance](#maintenance)

## Problèmes de Connexion

### Erreur : Impossible de se connecter à Redis

#### Symptômes
- Erreur "Connection refused"
- Timeout lors de la connexion
- Service ne démarre pas

#### Solutions
1. **Vérifier la configuration**
   ```bash
   # Vérifier les variables d'environnement
   echo $REDIS_HOST
   echo $REDIS_PORT
   echo $REDIS_PASSWORD
   ```

2. **Vérifier le service Redis**
   ```bash
   # Status du container Redis
   docker ps | grep redis
   
   # Logs du container
   docker logs sl3_redis
   ```

3. **Vérifier la connectivité réseau**
   ```bash
   # Test de connexion
   nc -zv $REDIS_HOST $REDIS_PORT
   ```

### Erreur : Authentification échouée

#### Symptômes
- Erreur "NOAUTH Authentication required"
- Erreur "ERR invalid password"

#### Solutions
1. **Vérifier le mot de passe**
   ```typescript
   // Vérifier la configuration
   const password = configService.get('REDIS_PASSWORD');
   console.log('Password configured:', !!password);
   ```

2. **Tester l'authentification**
   ```bash
   # Test direct avec redis-cli
   redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD ping
   ```

## Problèmes de Performance

### Latence Élevée

#### Symptômes
- Opérations Redis lentes
- Timeouts fréquents
- Queue d'opérations qui s'accumule

#### Solutions
1. **Monitoring des Métriques**
   ```typescript
   // Ajouter des métriques de temps
   const start = Date.now();
   await redisService.get(key);
   const duration = Date.now() - start;
   logger.debug(`Operation duration: ${duration}ms`);
   ```

2. **Optimisation des Opérations**
   ```typescript
   // Utiliser mget au lieu de multiples get
   const values = await redisService.mget(['key1', 'key2', 'key3']);
   
   // Utiliser pipeline pour les opérations multiples
   const pipeline = client.pipeline();
   keys.forEach(key => pipeline.get(key));
   const results = await pipeline.exec();
   ```

### Consommation Mémoire Excessive

#### Symptômes
- Utilisation mémoire croissante
- OOM errors
- Swapping

#### Solutions
1. **Monitoring Mémoire**
   ```bash
   # Vérifier l'utilisation mémoire Redis
   redis-cli info memory
   ```

2. **Gestion des TTL**
   ```typescript
   // Toujours utiliser des TTL
   await redisService.set(key, value, 3600); // 1 heure
   
   // Vérifier les clés sans TTL
   const keys = await redisService.keys('*');
   for (const key of keys) {
     const ttl = await redisService.ttl(key);
     if (ttl === -1) {
       logger.warn(`Key ${key} has no TTL`);
     }
   }
   ```

## Problèmes de Cluster

### Erreur : MOVED/ASK Redirections

#### Symptômes
- Erreurs MOVED fréquentes
- Latence accrue
- Opérations échouées

#### Solutions
1. **Vérifier la Configuration Cluster**
   ```bash
   # Vérifier l'état du cluster
   redis-cli -c -h $REDIS_HOST -p $REDIS_PORT cluster info
   ```

2. **Gérer les Redirections**
   ```typescript
   // Configurer le retry
   const options = {
     maxRedirections: 16,
     retryDelayOnFailover: 1000,
   };
   ```

### Erreur : Cluster Node Unavailable

#### Symptômes
- Nœuds inaccessibles
- Cluster state error
- Opérations partiellement réussies

#### Solutions
1. **Vérifier la Santé du Cluster**
   ```bash
   # Vérifier les nœuds
   redis-cli -c cluster nodes
   ```

2. **Implémenter la Résilience**
   ```typescript
   // Ajouter retry logic
   const retryOperation = async (operation: () => Promise<any>, maxRetries = 3) => {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await operation();
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await new Promise(resolve => setTimeout(resolve, 1000 * i));
       }
     }
   };
   ```

## Erreurs Courantes

### ERR_CLUSTER_DOWN

#### Diagnostic
```typescript
try {
  await redisService.ping();
} catch (error) {
  if (error.message.includes('CLUSTERDOWN')) {
    logger.error('Cluster is down, checking nodes...');
    // Vérifier chaque nœud
  }
}
```

#### Solution
```typescript
// Implémenter un health check
const checkClusterHealth = async () => {
  const nodes = await getClusterNodes();
  const results = await Promise.all(
    nodes.map(async node => {
      try {
        await node.ping();
        return true;
      } catch {
        return false;
      }
    })
  );
  return results.every(Boolean);
};
```

### ERR_CONNECTION_RESET

#### Diagnostic
```typescript
// Monitorer les déconnexions
client.on('end', () => {
  logger.warn('Connection ended');
});

client.on('error', (error) => {
  logger.error('Redis error:', error);
});
```

#### Solution
```typescript
// Implémenter reconnection logic
const connectWithRetry = async () => {
  while (true) {
    try {
      await client.connect();
      break;
    } catch (error) {
      logger.error('Connection failed, retrying in 5s...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};
```

## Monitoring et Logs

### Configuration des Logs

```typescript
// Niveaux de log recommandés
const logger = new Logger('RedisService');

// Debug
logger.debug('Opération détaillée', {
  operation: 'set',
  key,
  duration,
});

// Info
logger.log('État du service', {
  connected: true,
  mode: 'cluster',
});

// Warning
logger.warn('Performance dégradée', {
  latency: '100ms',
  queueSize: 1000,
});

// Error
logger.error('Erreur critique', {
  error: error.message,
  stack: error.stack,
});
```

### Métriques à Surveiller

```typescript
// Métriques de performance
const trackMetrics = async () => {
  const metrics = {
    operations: {
      total: 0,
      failed: 0,
      latency: [],
    },
    memory: {
      used: 0,
      peak: 0,
    },
    connections: {
      current: 0,
      rejected: 0,
    },
  };
  
  // Collecter les métriques
  setInterval(async () => {
    const info = await redisService.info();
    // Mettre à jour les métriques
    updateMetrics(metrics, info);
  }, 60000);
};
```

## Maintenance

### Nettoyage Périodique

```typescript
// Script de nettoyage
const cleanup = async () => {
  // Trouver les clés expirées
  const expiredKeys = await findExpiredKeys();
  
  // Supprimer par lots
  for (const batch of chunks(expiredKeys, 1000)) {
    await redisService.del(...batch);
  }
};

// Planifier le nettoyage
setInterval(cleanup, 24 * 60 * 60 * 1000); // Une fois par jour
```

### Backup

```typescript
// Script de backup
const backup = async () => {
  const timestamp = new Date().toISOString();
  const filename = `redis-backup-${timestamp}.rdb`;
  
  try {
    await redisService.save();
    logger.log(`Backup créé: ${filename}`);
  } catch (error) {
    logger.error('Erreur de backup:', error);
  }
};
```
