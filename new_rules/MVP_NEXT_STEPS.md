# Plan de Développement MVP - Swiss Live Event (SL3)

## Phase 1 : Streaming & Room Management

### 1.1 Structure de Base des Rooms
```typescript
// Types de base
interface Room {
  id: string;
  eventId: string;
  name: string;
  status: RoomStatus;
  streamKey?: string;
  streamUrl?: string;
  settings: RoomSettings;
  participants: string[]; // User IDs
  speakers: string[]; // User IDs
  moderators: string[]; // User IDs
}

interface RoomSettings {
  isPublic: boolean;
  chatEnabled: boolean;
  recordingEnabled: boolean;
  maxParticipants?: number;
  allowQuestions: boolean;
  language: string;
}

enum RoomStatus {
  CREATED = 'created',
  LIVE = 'live',
  PAUSED = 'paused',
  ENDED = 'ended'
}
```

#### Structure des Composants
```
components/
└── rooms/
    ├── room-container.tsx      # Conteneur principal de la room
    ├── stream/
    │   ├── stream-player.tsx   # Lecteur HLS
    │   ├── stream-controls.tsx # Contrôles du stream
    │   └── stream-info.tsx     # Informations du stream
    ├── chat/
    │   ├── chat-container.tsx  # Conteneur du chat
    │   ├── message-list.tsx    # Liste des messages
    │   └── message-input.tsx   # Input pour les messages
    └── controls/
        ├── room-settings.tsx   # Paramètres de la room
        └── participant-list.tsx # Liste des participants
```

### 1.2 Implémentation du Player Streaming

#### Configuration Video.js
```typescript
// Types pour le player
interface VideoPlayerProps {
  streamUrl: string;
  languages: Language[];
  initialLanguage?: Language;
  autoPlay?: boolean;
  poster?: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
  onLanguageChange?: (language: Language) => void;
}

// Configuration Video.js pour HLS
const videoJsOptions = {
  autoplay: true,
  controls: true,
  responsive: true,
  fluid: true,
  html5: {
    vhs: {
      overrideNative: true,
      enableLowInitialPlaylist: true,
      smoothQualityChange: true,
      fastQualityChange: true,
    },
  },
  controlBar: {
    children: [
      'playToggle',
      'progressControl',
      'volumePanel',
      'qualitySelector',
      'audioTrackButton',
      'fullscreenToggle',
    ],
  },
};
```

#### Composant VideoPlayer
```typescript
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  streamUrl,
  languages,
  initialLanguage,
  autoPlay = true,
  poster,
  onReady,
  onError,
  onLanguageChange,
}) => {
  const playerRef = useRef<HTMLVideoElement>(null);
  const videoJsRef = useRef<any>(null);

  useEffect(() => {
    if (!playerRef.current) return;

    videoJsRef.current = videojs(playerRef.current, {
      ...videoJsOptions,
      sources: [{
        src: streamUrl,
        type: 'application/x-mpegURL',
      }],
      poster,
    });

    // Setup language tracks
    languages.forEach((lang) => {
      videoJsRef.current.audioTracks().addTrack({
        id: lang,
        kind: 'translation',
        label: lang.toUpperCase(),
        language: lang,
      });
    });

    videoJsRef.current.ready(() => {
      onReady?.();
    });

    return () => {
      if (videoJsRef.current) {
        videoJsRef.current.dispose();
      }
    };
  }, [streamUrl]);

  return (
    <div className="video-container aspect-video">
      <video
        ref={playerRef}
        className="video-js vjs-big-play-centered"
      />
    </div>
  );
};
```

#### URLs de Test HLS Multilingue
```typescript
// URLs de test pour le développement
const TEST_STREAMS = {
  multi_audio: {
    url: 'https://storage.googleapis.com/shaka-demo-assets/sintel-multi-audio/dash.mpd',
    description: 'Sintel with multiple audio tracks',
    languages: ['en', 'fr', 'de'],
  },
  basic_hls: {
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    description: 'Basic HLS stream for testing',
    languages: ['en'],
  },
};
```

#### Intégration avec le Composant Room
```typescript
interface RoomStreamProps {
  room: Room;
  onStreamReady?: () => void;
  onStreamError?: (error: Error) => void;
}

const RoomStream: React.FC<RoomStreamProps> = ({
  room,
  onStreamReady,
  onStreamError,
}) => {
  return (
    <div className="room-stream-container">
      <VideoPlayer
        streamUrl={room.streamUrl || TEST_STREAMS.basic_hls.url}
        languages={room.languages}
        poster={room.thumbnail}
        onReady={onStreamReady}
        onError={onStreamError}
      />
      <div className="stream-info">
        <h2>{room.title}</h2>
        <StatusBadge status={room.status} />
      </div>
    </div>
  );
};
```

### 1.3 Chat en Temps Réel

#### WebSocket Setup
1. Utiliser Socket.IO pour la gestion des WebSockets
2. Structure des événements :
```typescript
interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'system' | 'question';
}

// Events
enum ChatEvents {
  MESSAGE = 'chat:message',
  JOIN = 'chat:join',
  LEAVE = 'chat:leave',
  TYPING = 'chat:typing'
}
```

## Phase 2 : Intégration Events-Rooms

### 2.1 Relations Events-Rooms
```typescript
interface Event {
  // ... existing fields
  rooms: Room[];
  defaultRoom?: string;
  roomConfiguration: {
    maxRooms: number;
    allowMultipleActive: boolean;
    requireModeration: boolean;
  };
}
```

### 2.2 Room Management Store
```typescript
interface RoomStore {
  activeRooms: Map<string, Room>;
  // Actions
  createRoom: (eventId: string, config: RoomConfig) => Promise<Room>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
  updateRoomSettings: (roomId: string, settings: Partial<RoomSettings>) => Promise<void>;
  startStream: (roomId: string) => Promise<void>;
  stopStream: (roomId: string) => Promise<void>;
}
```

## Bonnes Pratiques de Développement

### 1. Structure des Composants
- Utiliser des composants fonctionnels avec TypeScript
- Implémenter le pattern Container/Presenter
- Séparer la logique métier des composants UI

### 2. Gestion d'État
- Utiliser Zustand pour l'état global
- Créer des stores séparés pour Events, Rooms, et Chat
- Implémenter des selectors pour optimiser les performances

### 3. Tests
```typescript
// Exemple de test pour RoomStore
describe('RoomStore', () => {
  it('should create a new room', async () => {
    const store = useRoomStore();
    const room = await store.createRoom('event-1', {
      name: 'Test Room',
      isPublic: true
    });
    expect(store.activeRooms.has(room.id)).toBe(true);
  });
});
```

### 4. Error Handling
```typescript
class RoomError extends Error {
  constructor(
    message: string,
    public code: string,
    public data?: any
  ) {
    super(message);
    this.name = 'RoomError';
  }
}

// Usage
try {
  await roomStore.startStream(roomId);
} catch (error) {
  if (error instanceof RoomError) {
    // Handle specific room errors
  }
  // Handle other errors
}
```

## Bonnes Pratiques Spécifiques au Streaming

1. **Gestion de la Qualité**
   - Implémenter la sélection automatique de qualité (ABR)
   - Permettre la sélection manuelle de qualité
   - Sauvegarder les préférences utilisateur

2. **Gestion des Langues**
   - Interface claire pour la sélection de langue
   - Persistance du choix de langue
   - Fallback sur la langue par défaut

3. **Optimisations**
   - Préchargement du player pour les rooms "upcoming"
   - Gestion intelligente du buffer
   - Monitoring des métriques de streaming

4. **Gestion des Erreurs**
   - Retry automatique en cas d'erreur réseau
   - Messages d'erreur utilisateur clairs
   - Logging des erreurs pour monitoring

## Ordre de Priorité MVP

1. **Streaming de Base**
   - Implémentation HLS basique
   - Lecture du stream
   - Contrôles basiques (play/pause)

2. **Chat Simple**
   - Messages texte uniquement
   - Sans modération complexe
   - Liste des participants basique

3. **Gestion des Rooms**
   - Création/Suppression
   - Join/Leave
   - Paramètres basiques

4. **Intégration Events**
   - Liaison Events-Rooms
   - Navigation entre rooms
   - Gestion des permissions basiques

## Points d'Attention Techniques

1. **Performance**
   - Lazy loading des composants non-critiques
   - Optimisation des re-renders avec React.memo
   - Mise en cache appropriée des données

2. **Sécurité**
   - Validation des tokens pour le streaming
   - Sanitization des messages du chat
   - Vérification des permissions

3. **Scalabilité**
   - Architecture modulaire
   - Services indépendants
   - Cache distribué pour les sessions

## Métriques de Succès MVP

1. **Streaming**
   - Latence < 5 secondes
   - Stabilité du stream > 99%
   - Support de 100 viewers simultanés

2. **Chat**
   - Délai message < 500ms
   - Support de 50 messages/seconde
   - Historique limité à 200 messages

3. **Performance Générale**
   - Temps de chargement initial < 3s
   - Time to Interactive < 5s
   - Score Lighthouse > 80
