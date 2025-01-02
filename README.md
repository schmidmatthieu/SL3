# SL3 Beta

## Description

SL3 Beta est une application de gestion d'événements et de salles en temps réel, construite avec Next.js et NestJS.

## Fonctionnalités

### Gestion des Utilisateurs

- **Authentification** : Système complet de connexion/inscription
- **Rôles Utilisateurs** :
  - `ADMIN` : Accès complet à toutes les fonctionnalités
  - `EVENT_ADMIN` : Gestion des événements
  - `ROOM_MODERATOR` : Modération des salles
  - `ROOM_SPEAKER` : Participation active dans les salles
  - `PARTICIPANT` : Participation basique
- **Paramètres Utilisateur** :
  - Gestion du profil (nom, prénom, username)
  - Upload d'avatar
  - Changement de mot de passe
  - Préférences de langue (Français/Anglais)
  - Préférences de thème (Clair/Sombre/Système)

### Gestion des Événements

- Création et modification d'événements
- Gestion des participants
- Configuration des salles

## Architecture Technique

### Frontend (Next.js)

- Framework UI : Shadcn/ui
- Gestion d'état : Zustand
- Validation des formulaires : Zod
- Internationalisation : i18n
- Thème : Theme Provider (Light/Dark/System)

### Backend (NestJS)

- Base de données : MongoDB avec Mongoose
- Authentication : JWT
- Upload de fichiers : Multer
- Validation : Class Validator

## Installation

1. Cloner le repository :

```bash
git clone [repository-url]
```

2. Installer les dépendances :

```bash
pnpm install
```

3. Configurer les variables d'environnement :

```bash
cp .env.example .env
```

4. Démarrer les services :

```bash
docker-compose up -d
```

5. Lancer l'application :

```bash
pnpm dev
```

## Développement

### Structure du Projet

```
SL3_beta/
├── apps/
│   ├── api/           # Backend NestJS
│   └── web/           # Frontend Next.js
├── components/        # Composants React réutilisables
├── store/            # État global (Zustand)
└── docker/           # Configuration Docker
```

## Contribution

1. Créer une branche pour votre fonctionnalité
2. Commiter vos changements
3. Créer une Pull Request

## License

[License Type]
