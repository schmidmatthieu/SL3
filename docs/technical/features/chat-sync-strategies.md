# Stratégies de Synchronisation du Chat

## Vue d'Ensemble

Ce document détaille les stratégies mises en place pour maintenir la cohérence entre le système de chat et le système de room principal.

## Points de Synchronisation

### 1. Participants et Rôles

#### Événements à Surveiller
- Ajout/Suppression de participant dans une Room
- Modification des rôles (ADMIN, EVENT_ADMIN, etc.)
- Bannissement/Débannissement d'utilisateur
- Mise à jour des permissions

#### Stratégie de Synchronisation
```typescript
@Injectable()
export class ParticipantSyncService {
  constructor(
    private readonly roomService: RoomService,
    private readonly chatRoomService: ChatRoomService,
    private readonly logger: ChatLogger,
  ) {}

  @OnEvent('room.participant.added')
  async handleParticipantAdded(payload: ParticipantAddedEvent) {
    try {
      await this.chatRoomService.syncParticipant(payload);
      this.logger.log('sync', 'participant.added', payload);
    } catch (error) {
      await this.handleSyncError('participant.added', error, payload);
    }
  }

  @OnEvent('room.participant.removed')
  async handleParticipantRemoved(payload: ParticipantRemovedEvent) {
    // Similaire à l'ajout
  }
}
```

### 2. État de la Room

#### Événements à Surveiller
- Changement de statut (UPCOMING, LIVE, ENDED, etc.)
- Archivage/Désarchivage
- Modification des paramètres (isPublic, chatEnabled, etc.)

#### Stratégie de Synchronisation
```typescript
@Injectable()
export class RoomStateSyncService {
  @OnEvent('room.status.changed')
  async handleStatusChanged(payload: RoomStatusEvent) {
    await this.updateChatRoomState(payload);
  }

  private async updateChatRoomState(event: RoomStatusEvent) {
    // Logique de mise à jour avec gestion des erreurs
  }
}
```

### 3. Vérification de Cohérence

#### Vérification Périodique
```typescript
@Injectable()
export class ConsistencyCheckService {
  @Cron('0 */1 * * *') // Toutes les heures
  async checkConsistency() {
    const inconsistencies = await this.findInconsistencies();
    await this.repairInconsistencies(inconsistencies);
  }

  private async findInconsistencies() {
    // Vérification des participants
    // Vérification des rôles
    // Vérification des états
  }
}
```

## Gestion des Erreurs

### 1. Types d'Erreurs
- Erreurs de synchronisation temporaires
- Incohérences de données
- Erreurs de validation

### 2. Stratégies de Récupération
```typescript
@Injectable()
export class SyncErrorHandler {
  async handleSyncError(
    type: string,
    error: Error,
    payload: any
  ) {
    // 1. Log détaillé
    this.logger.error(type, error, payload);

    // 2. Tentatives de réessai
    if (this.isRetryable(error)) {
      await this.retryWithBackoff(type, payload);
    }

    // 3. Notification
    await this.notifyAdmins(type, error, payload);
  }
}
```

## Monitoring

### 1. Métriques Clés
- Taux de succès de synchronisation
- Temps de synchronisation
- Nombre d'incohérences détectées
- Temps de résolution des incohérences

### 2. Alertes
```typescript
@Injectable()
export class SyncMonitoringService {
  private readonly alertThresholds = {
    syncDelay: 5000, // 5 secondes
    errorRate: 0.01, // 1%
    inconsistencyCount: 10,
  };

  async checkHealthMetrics() {
    const metrics = await this.collectMetrics();
    await this.evaluateMetrics(metrics);
  }
}
```

## Maintenance

### 1. Tâches Quotidiennes
- Vérification des logs de synchronisation
- Analyse des métriques de performance
- Résolution des incohérences détectées

### 2. Tâches Hebdomadaires
- Revue des erreurs de synchronisation
- Optimisation des indexes
- Nettoyage des données obsolètes

### 3. Tâches Mensuelles
- Audit complet de la cohérence
- Revue des performances
- Mise à jour de la documentation

## Procédures de Récupération

### 1. Perte de Connexion Redis
```typescript
@Injectable()
export class RedisRecoveryService {
  async handleRedisFailure() {
    // 1. Basculement sur le cache local
    // 2. Tentative de reconnexion
    // 3. Resynchronisation des données
  }
}
```

### 2. Incohérence Majeure
1. Arrêt des écritures sur le chat concerné
2. Analyse de l'étendue de l'incohérence
3. Exécution du plan de correction
4. Validation des données
5. Reprise des écritures

## Best Practices

### 1. Développement
- Toujours utiliser les services de synchronisation
- Tester les scénarios d'erreur
- Documenter les changements impactant la synchronisation

### 2. Déploiement
- Déployer d'abord les changements de schéma
- Vérifier la cohérence après chaque déploiement
- Avoir un plan de rollback
