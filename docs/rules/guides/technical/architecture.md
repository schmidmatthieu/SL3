# Architecture SL3

## Vue d'Ensemble

SL3 (Swiss Live Event) est une plateforme de streaming et d'événements en direct conçue avec une architecture moderne, modulaire et évolutive. Ce document détaille la structure actuelle et les plans d'évolution.

## Architecture Actuelle

### Structure Globale

```typescript
# Structure Globale du Projet
├── apps/
│   ├── web/                  # Application Next.js frontend
│   │   ├── app/             
│   │   │   ├── (auth)/     
│   │   │   │   ├── events/
│   │   │   │   │   ├── page.tsx          # Liste des événements
│   │   │   │   │   ├── create/           # Création d'événement
│   │   │   │   │   └── [slug]/           # Page d'événement
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       ├── layout.tsx
│   │   │   │   │       ├── event-page-client.tsx
│   │   │   │   │       ├── @modal/        # Modales contextuelles
│   │   │   │   │       ├── [roomSlug]/    # Page de room
│   │   │   │   │       │   ├── page.tsx
│   │   │   │   │       │   ├── room-content.tsx
│   │   │   │   │       │   ├── speaker/   # Vue speaker
│   │   │   │   │       │   │   └── page.tsx
│   │   │   │   │       │   └── mod/      # Vue modérateur
│   │   │   │   │       │       └── page.tsx
│   │   │   │   │       └── manage/        # Gestion événement
│   │   │   │   │           ├── speakers/
│   │   │   │   │           ├── rooms/
│   │   │   │   │           ├── settings/
│   │   │   │   │           ├── security/
│   │   │   │   │           ├── analytics/
│   │   │   │   │           └── mod/
│   │   │   │   ├── admin/
│   │   │   │   └── profil-settings/
│   │   │   ├── (legal)/
│   │   │   ├── (marketing)/
│   │   │   └── i18n/
│   │   ├── components/
│   │   │   ├── core/                     # Composants de base
│   │   │   │   ├── layout/               # Layouts communs
│   │   │   │   ├── ui/                   # UI components (shadcn)
│   │   │   │   └── shared/               # Composants partagés
│   │   │   ├── features/                 # Composants par feature
│   │   │   │   ├── events-global/        # Composants événements
│   │   │   │   │   ├── event-card/
│   │   │   │   │   ├── event-detail/
│   │   │   │   │   ├── management/
│   │   │   │   │   └── status/
│   │   │   │   ├── rooms-global/         # Composants rooms
│   │   │   │   │   ├── room-detail/     # Détails d'une room
│   │   │   │   │   │   ├── index.tsx
│   │   │   │   │   │   ├── room-details.tsx
│   │   │   │   │   │   ├── room-status-badge.tsx
│   │   │   │   │   │   ├── room-tabs.tsx
│   │   │   │   │   │   ├── stream/      # Streaming
│   │   │   │   │   │   ├── chat/        # Chat temps réel
│   │   │   │   │   │   ├── qa-section.tsx
│   │   │   │   │   │   ├── files-section.tsx
│   │   │   │   │   │   └── votes-section.tsx
│   │   │   │   │   ├── management/      # Gestion des rooms
│   │   │   │   │   ├── speaker/         # Composants speaker
│   │   │   │   │   ├── room-filters.tsx
│   │   │   │   │   └── room-preview.tsx
│   │   │   │   └── users/
│   │   │   └── pages/                    # Composants de page
│   │   ├── lib/
│   │   │   ├── store/                    # Stores Zustand
│   │   │   ├── hooks/                    # Custom hooks
│   │   │   └── utils/                    # Utilitaires
│   │   └── types/                        # Types TypeScript
│   └── api/                              # Backend NestJS
        ├── src/
        │   ├── modules/                  # Modules NestJS
        │   │   ├── events/              
        │   │   ├── rooms/
        │   │   ├── users/
        │   │   └── shared/
        │   ├── common/                   # Code partagé
        │   └── config/                   # Configuration
        └── test/                         # Tests
```

### Composants Principaux

#### 1. Streaming
```typescript
// Structure du streaming
├── stream/
│   ├── video-player.tsx       # Lecteur vidéo principal
│   ├── stream-controls.tsx    # Contrôles de streaming
│   ├── quality-selector.tsx   # Sélection qualité
│   └── stream-status.tsx      # État du stream
```
- Support HLS multi-qualité
- Adaptation automatique de la qualité
- Métriques en temps réel
- Gestion des sources externes (YouTube, Vimeo)

#### 2. Chat en Temps Réel
```typescript
// Structure du chat
├── chat/
│   ├── chat-container.tsx    # Conteneur principal
│   ├── message-list.tsx      # Liste des messages
│   ├── chat-input.tsx        # Zone de saisie
│   ├── user-list.tsx         # Liste des utilisateurs
│   └── moderation/           # Outils de modération
```
- WebSocket avec Socket.IO
- Historique des messages
- Modération en temps réel
- Support des emojis et mentions

#### 3. Questions & Réponses
```typescript
// Structure Q&A
├── qa-section/
│   ├── question-list.tsx     # Liste des questions
│   ├── question-form.tsx     # Formulaire de question
│   ├── voting.tsx           # Système de vote
│   └── moderation.tsx       # Interface modérateur
```
- Tri et filtrage des questions
- Système de votes
- Marquage des réponses
- Export des Q&A

#### 4. Gestion des Fichiers
```typescript
// Structure fichiers
├── files-section/
│   ├── file-list.tsx        # Liste des fichiers
│   ├── upload.tsx           # Upload de fichiers
│   ├── preview.tsx          # Prévisualisation
│   └── download.tsx         # Téléchargement
```
- Upload sécurisé
- Prévisualisation intégrée
- Gestion des permissions
- Limite de taille (50MB)

#### 5. Système de Vote
```typescript
// Structure votes
├── votes-section/
│   ├── poll-list.tsx        # Liste des sondages
│   ├── poll-creator.tsx     # Création de sondage
│   ├── vote-display.tsx     # Affichage résultats
│   └── export.tsx           # Export des données
```
- Sondages en temps réel
- Visualisation des résultats
- Export des données
- Modération des votes

### Gestion d'État

```typescript
// Structure des stores
interface RoomState {
  // Configuration
  id: string;
  name: string;
  status: 'idle' | 'live' | 'ended';
  
  // Paramètres
  settings: {
    features: {
      chat: boolean;
      qa: boolean;
      files: boolean;
      votes: boolean;
    };
    permissions: {
      chat: UserRole[];
      qa: UserRole[];
      files: UserRole[];
      votes: UserRole[];
    };
  };
  
  // Participants
  participants: {
    viewers: {
      count: number;
      active: number;
    };
    speakers: Speaker[];
    moderators: Moderator[];
  };
  
  // États des composants
  stream: {
    status: 'idle' | 'loading' | 'playing' | 'error';
    quality: {
      current: string;
      available: string[];
    };
    source: {
      type: 'hls' | 'youtube' | 'vimeo';
      url: string;
    };
  };
  
  chat: {
    messages: Message[];
    unreadCount: number;
    participants: string[];
    status: 'active' | 'disabled' | 'moderated';
  };
  
  qa: {
    questions: Question[];
    answered: number;
    pending: number;
    topVoted: Question[];
  };
  
  files: {
    items: File[];
    uploading: boolean;
    totalSize: number;
  };
  
  votes: {
    active: Poll[];
    completed: Poll[];
    participation: number;
  };
}
```

## Templates Futurs (Détaillés)

### 1. Nouvelles Routes [TEMPLATE]
```typescript
// Structure future des routes
├── app/
│   ├── (auth)/
│   │   ├── events/
│   │   │   └── [slug]/
│   │   │       ├── [roomSlug]/
│   │   │       │   ├── analytics/           
│   │   │       │   │   ├── realtime/       # Métriques en temps réel
│   │   │       │   │   │   ├── viewers/    # Statistiques viewers
│   │   │       │   │   │   ├── engagement/ # Métriques engagement
│   │   │       │   │   │   └── quality/    # Qualité du stream
│   │   │       │   │   └── reports/        # Rapports détaillés
│   │   │       │   ├── settings/           
│   │   │       │   │   ├── stream/         # Config. streaming
│   │   │       │   │   ├── features/       # Activation modules
│   │   │       │   │   └── access/         # Gestion accès
│   │   │       │   └── history/            
│   │   │       │       ├── sessions/       # Sessions passées
│   │   │       │       ├── chat/           # Historique chat
│   │   │       │       └── interactions/   # Historique interactions
│   │   │       └── manage/
│   │   │           ├── billing/            
│   │   │           │   ├── plans/          # Plans et tarifs
│   │   │           │   ├── usage/          # Consommation
│   │   │           │   └── invoices/       # Factures
│   │   │           └── reports/            
│   │   │               ├── performance/     # Perf. technique
│   │   │               ├── engagement/      # Engagement users
│   │   │               └── export/         # Export données
│   │   └── admin/
│   │       ├── monitoring/                 
│   │       │   ├── system/                 # État système
│   │       │   ├── rooms/                  # État rooms
│   │       │   └── users/                  # Activité users
│   │       └── system/                     
│   │           ├── settings/               # Config. globale
│   │           ├── integrations/           # Services externes
│   │           └── maintenance/            # Maintenance
```

### 2. Nouveaux Composants Room [TEMPLATE]
```typescript
// Structure future des composants
├── components/
│   └── features/
│       └── rooms-global/
│           ├── room-detail/
│           │   ├── stream/
│           │   │   ├── multi-quality/     
│           │   │   │   ├── adaptive/      # Adaptation auto
│           │   │   │   ├── manual/        # Sélection manuelle
│           │   │   │   └── metrics/       # Métriques qualité
│           │   │   ├── audio-tracks/      
│           │   │   │   ├── selector/      # Sélection piste
│           │   │   │   ├── mixer/         # Mixage audio
│           │   │   │   └── equalizer/     # Égaliseur
│           │   │   └── recording/         
│           │   │       ├── controls/      # Contrôles enreg.
│           │   │       ├── preview/       # Prévisualisation
│           │   │       └── export/        # Export
│           │   ├── chat/
│           │   │   ├── moderation/        
│           │   │   │   ├── filters/       # Filtres auto
│           │   │   │   ├── actions/       # Actions modo
│           │   │   │   └── reports/       # Signalements
│           │   │   ├── features/          
│           │   │   │   ├── threads/       # Discussions
│           │   │   │   ├── reactions/     # Réactions
│           │   │   │   └── mentions/      # Mentions
│           │   │   └── analytics/         
│           │   │       ├── sentiment/     # Analyse sentiment
│           │   │       ├── engagement/    # Engagement
│           │   │       └── trends/        # Tendances
│           │   ├── qa/
│           │   │   ├── auto-moderation/   
│           │   │   │   ├── filters/       # Filtres IA
│           │   │   │   ├── scoring/       # Score pertinence
│           │   │   │   └── actions/       # Actions auto
│           │   │   └── categorization/    
│           │   │       ├── auto-tags/     # Tags auto
│           │   │       ├── clustering/    # Regroupement
│           │   │       └── routing/       # Routage questions
│           │   ├── polls/                 
│           │   │   ├── creation/
│           │   │   │   ├── templates/     # Templates
│           │   │   │   ├── builder/       # Constructeur
│           │   │   │   └── preview/       # Prévisualisation
│           │   │   ├── responses/
│           │   │   │   ├── collection/    # Collecte
│           │   │   │   ├── validation/    # Validation
│           │   │   │   └── display/       # Affichage
│           │   │   └── analytics/
│           │   │       ├── results/       # Résultats
│           │   │       ├── insights/      # Insights
│           │   │       └── export/        # Export
│           │   └── breakout/              
│           │       ├── rooms/             # Salles
│           │       ├── assignments/       # Affectations
│           │       └── monitoring/        # Supervision
│           └── analytics/                 
│               ├── realtime/              # Temps réel
│               ├── historical/            # Historique
│               └── reports/               # Rapports
```

### 3. Nouveaux Services [TEMPLATE]
```typescript
@Injectable()
export class EnhancedStreamingService {
  // Gestion avancée du streaming
  async initializeStream(config: StreamConfig): Promise<StreamSession>;
  async switchQuality(quality: StreamQuality): Promise<void>;
  async switchAudioTrack(track: AudioTrack): Promise<void>;
  async startRecording(options: RecordingOptions): Promise<Recording>;
  
  // Monitoring avancé
  async getStreamHealth(): Promise<StreamHealth>;
  async getViewerMetrics(): Promise<ViewerMetrics>;
  async getNetworkStats(): Promise<NetworkStats>;
}

@Injectable()
export class RoomAnalyticsService {
  // Métriques avancées
  async getRoomEngagement(roomId: string): Promise<RoomEngagement>;
  async getComponentUsage(roomId: string): Promise<ComponentUsage>;
  async getUserBehavior(roomId: string): Promise<UserBehavior>;
  
  // Rapports détaillés
  async generateSessionReport(sessionId: string): Promise<SessionReport>;
  async generateEngagementReport(roomId: string): Promise<EngagementReport>;
  async exportAnalytics(options: ExportOptions): Promise<AnalyticsExport>;
}

@Injectable()
export class RoomOrchestrationService {
  // Gestion avancée des rooms
  async createBreakoutRooms(config: BreakoutConfig): Promise<BreakoutSession>;
  async manageParticipants(actions: ParticipantActions): Promise<void>;
  async configureFeatures(features: FeatureConfig): Promise<void>;
  
  // Intégrations
  async connectExternalService(service: ExternalService): Promise<Connection>;
  async synchronizeData(options: SyncOptions): Promise<SyncResult>;
}

## Standards de Développement

### Composants Room
- Isolation fonctionnelle
- État local minimal
- Props typées
- Tests complets

### Performance
- Lazy loading composants
- Optimisation websockets
- Mise en cache données
- Monitoring temps réel
