# Stack Technologique SL3

## Vue d'Ensemble

### 🎨 Frontend

- **Framework** : Next.js 15
- **Language** : TypeScript
- **Styling** :
  - Tailwind CSS
  - shadcn/ui
- **State Management** : Zustand
- **Data Fetching** :
  - SWR/TanStack Query
  - Socket.IO client
- **Internationalisation** : i18next

### 🔧 Backend

- **Runtime** : Node.js 22.10.2
- **Framework** : NestJS
- **Language** : TypeScript
- **Database** :
  - MongoDB avec Mongoose
  - Redis (cache & real-time)
- **WebSocket** : Socket.IO
- **Streaming** : HLS

### 🏗️ Infrastructure

- **CI/CD** : GitHub Actions
- **Containerisation** : Docker
- **Base de données** :
  - MongoDB (données principales)
  - Redis (cache et temps réel)
- **Streaming** : HLS multi-qualité

## Structure du Projet

```
# Structure Globale
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
│   │   │   │   │       │   └── mod/       # Vue modérateur
│   │   │   │   │       └── manage/        # Gestion événement
│   │   │   │   ├── admin/                # Administration
│   │   │   │   └── profile-settings/     # Paramètres utilisateur
│   │   │   ├── (legal)/                  # Pages légales
│   │   │   ├── (marketing)/              # Pages marketing
│   │   │   └── i18n/                     # Traductions
│   │   ├── components/
│   │   │   ├── core/                     # Composants de base
│   │   │   │   ├── layout/               # Layouts communs
│   │   │   │   ├── ui/                   # UI components (shadcn)
│   │   │   │   └── shared/               # Composants partagés
│   │   │   ├── features/                 # Composants par feature
│   │   │   │   ├── events-global/        # Composants événements
│   │   │   │   ├── rooms-global/         # Composants rooms
│   │   │   │   │   ├── room-detail/     
│   │   │   │   │   │   ├── stream/       # Streaming
│   │   │   │   │   │   ├── chat/         # Chat temps réel
│   │   │   │   │   │   ├── qa-section/   # Q&A
│   │   │   │   │   │   ├── files-section/# Partage fichiers
│   │   │   │   │   │   └── votes-section/# Système de vote
│   │   │   │   └── users/                # Gestion utilisateurs
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

# Structure d'une Feature
components/features/[feature-name]/
├── [component-name]/                     # Composant principal
│   ├── index.tsx                        # Export principal
│   ├── component-name.tsx               # Si plus de 300 lignes
│   ├── sub-components/                  # Sous-composants
│   │   ├── part-one.tsx
│   │   └── part-two.tsx
│   └── __tests__/                      # Tests unitaires
└── ui/                                  # UI spécifique
```

## Stratégies Techniques

### 🔄 Architecture Temps Réel

- **WebSocket avec Socket.IO**
  - Connexions par salle (room)
  - Reconnexion automatique
  - File d'attente de messages
  - Limitation de débit
  - Mécanismes de fallback HTTP

- **Streaming HLS**
  - Multi-qualité adaptative
  - Faible latence
  - Fallback automatique
  - Métriques en temps réel

### 📦 Stratégie de Cache

1. **Redis**
   - Sessions utilisateurs
   - État temps réel des rooms
   - File d'attente de messages
   - Cache de données fréquentes

2. **MongoDB**
   - Cache d'agrégation
   - Résultats de requêtes fréquentes
   - Indexation optimisée

3. **Frontend**
   - Cache statique Next.js
   - Cache SWR/TanStack Query
   - Service Worker (offline)
   - Prefetching intelligent

### 🔒 Sécurité

1. **Authentication**
   - JWT avec rotation
   - Sessions Redis
   - Refresh tokens
   - OAuth 2.0 / OpenID Connect

2. **API**
   - Rate limiting par IP/user
   - CORS configuré
   - Validation des entrées
   - Sanitization des données
   - Protection CSRF

3. **Frontend**
   - CSP headers
   - XSS protection
   - CSRF tokens
   - Secure cookies
   - Input validation

### 📊 Monitoring

1. **Performance**
   - Métriques serveur (CPU, mémoire)
   - Web Vitals (LCP, FID, CLS)
   - Temps de réponse API
   - Métriques WebSocket
   - Métriques streaming

2. **Erreurs**
   - Logging structuré
   - Stack traces détaillées
   - Error boundaries React
   - Alerting automatique
   - Traçage distribué

3. **Business**
   - KPIs utilisateurs
   - Métriques streaming
   - Engagement temps réel
   - Analytics événements
   - Rapports automatisés

## Standards de Développement

### 🔧 Configuration

- ESLint pour le linting
- Prettier pour le formatting
- Husky pour les git hooks
- Jest pour les tests
- TypeScript strict mode
- Commitlint pour les commits

### 📝 Documentation

- TSDoc pour les interfaces
- Swagger pour l'API
- Storybook pour les composants
- README par module
- Guides de contribution
- Documentation technique

### 🧪 Tests

- **Tests Unitaires**
  - Jest pour le code
  - React Testing Library
  - Tests de stores
  - Tests de hooks

- **Tests E2E**
  - Cypress
  - Tests de flux complets
  - Tests multi-browser
  - Tests responsive

- **Tests d'Intégration**
  - API endpoints
  - WebSocket
  - Base de données
  - Cache

- **Tests de Performance**
  - k6 pour le load testing
  - Lighthouse CI
  - Tests de streaming
  - Tests de concurrence
