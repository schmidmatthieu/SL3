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
/
├── app/                    # Routes et pages Next.js
├── components/            # Composants React
├── config/               # Configurations
├── hooks/                # Custom hooks React
├── lib/                  # Utilitaires et helpers
├── middleware/           # Middleware Next.js
├── new_rules/           # Documentation et règles
├── public/              # Assets statiques
├── services/            # Services métier
├── store/               # Stores Zustand
├── styles/              # Styles globaux
├── types/               # Types TypeScript
├── utils/               # Utilitaires généraux
└── apps/                # Backend NestJS
    └── api/
        ├── src/
        │   ├── modules/
        │   ├── common/
        │   └── main.ts
```

## Stratégies Techniques

### 🔄 Architecture Temps Réel

- Communication basée sur WebSocket
- Connexions par salle
- Reconnexion automatique
- File d'attente de messages
- Limitation de débit
- Mécanismes de fallback

### 📦 Stratégie de Cache

1. **Redis**

   - Données de session
   - État temps réel
   - File d'attente de messages

2. **MongoDB**

   - Cache d'agrégation
   - Résultats de requêtes fréquentes

3. **Frontend**
   - Cache statique Next.js
   - Cache SWR/TanStack Query
   - Service Worker (offline)

### 🔒 Sécurité

1. **Authentication**

   - JWT avec rotation
   - Sessions Redis
   - Refresh tokens

2. **API**

   - Rate limiting
   - CORS configuré
   - Validation des entrées
   - Sanitization des données

3. **Frontend**
   - CSP headers
   - XSS protection
   - CSRF tokens

### 📊 Monitoring

1. **Performance**

   - Métriques serveur
   - Web Vitals
   - Temps de réponse API

2. **Erreurs**

   - Logging structuré
   - Stack traces
   - Error boundaries React

3. **Business**
   - KPIs utilisateurs
   - Métriques streaming
   - Engagement temps réel

## Standards de Développement

### 🔧 Configuration

- ESLint pour le linting
- Prettier pour le formatting
- Husky pour les git hooks
- Jest pour les tests
- TypeScript strict mode

### 📝 Documentation

- TSDoc pour les interfaces
- Swagger pour l'API
- Storybook pour les composants
- README par module

### 🧪 Tests

- Tests unitaires Jest
- Tests E2E Cypress
- Tests d'intégration
- Tests de performance k6
