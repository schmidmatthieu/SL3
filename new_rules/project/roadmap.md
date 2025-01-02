# Swiss Live Event (SL3) - Roadmap

## État du Projet

- **Dernière mise à jour** : 2025-01-02
- **Version** : Beta
- **État Global** : En développement actif

## Fonctionnalités Complétées

### Infrastructure & Setup (Phase 1)

- [x] Setup initial Next.js frontend
- [x] Migration de Supabase vers NestJS backend
- [x] Configuration base de données MongoDB
- [x] Mise en place i18n et language switcher
- [x] Configuration ESLint et TypeScript
- [x] Setup des stores Zustand

### Authentification & Utilisateurs (Phase 2)

- [x] Système d'authentification
- [x] Gestion des rôles (Admin, Moderator, User)
- [x] Protection des routes API
- [x] Profil utilisateur
- [x] Déconnexion sécurisée

### Gestion des Événements (Phase 3)

- [x] CRUD événements
- [x] Interface d'administration des événements
- [x] Gestion des salles
- [x] Événements mis en avant
- [x] Traductions des événements

### Gestion des Intervenants (Phase 4)

- [x] Interface de gestion des speakers
- [x] Association speakers-événements
- [x] Profils des intervenants

### Gestion des Médias (Phase 5)

- [x] Upload et gestion des images
- [x] Édition des métadonnées
- [x] Interface de gestion des médias
- [x] Correction des bugs d'upload

### UI/UX (Continu)

- [x] Design système avec Tailwind
- [x] Composants shadcn/ui
- [x] Effets glassmorphism
- [x] Amélioration de l'accessibilité
- [x] Thème et styles globaux
- [x] Composants modaux

## Objectifs MVP - En Cours

### Priorité Haute (Sprint Actuel)

#### Streaming

- [ ] Implémentation HLS
  - Status : En cours
  - PR : -
  - Notes : Configuration serveur média

#### Chat Temps Réel

- [ ] Système de chat basique
  - Status : Planifié
  - Dépendances : WebSocket
  - Notes : Modération basique

### Priorité Moyenne (Prochains Sprints)

#### Room Management

- [ ] Interface modérateur
  - Status : En développement
  - Notes : Contrôles de stream

#### Analytics

- [ ] Métriques basiques
  - Status : Planifié
  - Notes : KPIs essentiels

## Fonctionnalités Post-MVP

### Système de Vote

- [ ] Votes en temps réel
- [ ] Interface de création de votes
- [ ] Visualisation des résultats
- [ ] Export des données

### Analytics Avancés

- [ ] Dashboard détaillé
- [ ] Rapports personnalisés
- [ ] Métriques temps réel

### Interactions Avancées

- [ ] Q&A modéré
- [ ] Sondages interactifs
- [ ] Réactions en direct

## Métriques Projet

### Performance

- **Build Time** : < 2min
- **Lighthouse Score** : 85+
- **Core Web Vitals** : En cours d'optimisation

### Qualité Code

- **Coverage** : 75%
- **TypeScript** : Strict mode
- **Lint** : 0 erreurs

### Dette Technique

- **Niveau** : Moyen
- **Points d'attention** :
  - Optimisation des requêtes MongoDB
  - Tests E2E à implémenter
  - Documentation API à compléter

## Process de Mise à Jour

### Commits

Format : `type(scope): description`
Types :

- feat : Nouvelle fonctionnalité
- fix : Correction de bug
- refactor : Refactoring
- style : Modifications UI
- chore : Maintenance

### Review

- Daily : Update des statuts
- Sprint : Review des priorités
- Release : Update version et changelog
