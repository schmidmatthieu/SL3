# Progression du formatage Prettier

## Configuration
- [x] .prettierrc.js
- [x] .prettierignore
- [x] package.json (scripts)

## Fichiers de configuration
- [x] next.config.js
- [x] postcss.config.js
- [ ] tailwind.config.ts
- [ ] tsconfig.json
- [ ] middleware.ts

## App (Frontend)
### Pages principales
- [ ] app/page.tsx
- [ ] app/layout.tsx
- [ ] app/not-found.tsx
- [ ] app/globals.css

### Authentification et Profil
- [ ] app/login/page.tsx
- [ ] app/settings/page.tsx

### Événements
- [ ] app/events/page.tsx
- [ ] app/events/create/page.tsx
- [ ] app/events/[eventId]/page.tsx
- [ ] app/events/[eventId]/event-page-client.tsx
- [ ] app/events/[eventId]/layout.tsx
- [ ] app/events/[eventId]/not-found.tsx

### Gestion des salles
- [ ] app/events/[eventId]/rooms/page.tsx
- [ ] app/events/[eventId]/rooms/[roomId]/page.tsx
- [ ] app/events/[eventId]/rooms/[roomId]/room-content.tsx
- [ ] app/events/[eventId]/rooms/[roomId]/mod/page.tsx
- [ ] app/events/[eventId]/rooms/[roomId]/speaker/page.tsx

### Administration
- [ ] app/admin/layout.tsx
- [ ] app/admin/page.tsx

### API Routes
- [ ] app/api/v1/auth/signup/route.ts
- [ ] app/api/v1/auth/callback/route.ts
- [ ] app/api/v1/roles/event-moderator/route.ts
- [ ] app/api/v1/roles/room-moderator/route.ts
- [ ] app/api/v1/roles/speaker/route.ts
- [ ] app/api/v1/speakers/route.ts
- [ ] app/api/v1/upload/route.ts

### Internationalisation
- [ ] app/i18n/I18nProvider.tsx
- [ ] app/i18n/client.ts
- [ ] app/i18n/settings.ts
- [ ] app/i18n.ts

## Components
### UI Components
- [ ] components/ui/* (tous les composants UI)

### Management Components
- [ ] components/management/analytics/view-analytics.tsx
- [ ] components/management/event-dashboard.tsx
- [ ] components/management/moderator-management.tsx
- [ ] components/management/room-overview.tsx
- [ ] components/management/rooms/edit-room-dialog.tsx
- [ ] components/management/rooms/manage-rooms.tsx
- [ ] components/management/security/security-settings.tsx
- [ ] components/management/settings/event-settings.tsx

### Admin Components
- [ ] components/admin/admin-dashboard.tsx

## Stores
- [ ] store/*.ts (tous les fichiers store)

## Hooks
- [ ] hooks/*.ts (tous les fichiers hooks)

## Types
- [ ] types/*.ts (tous les fichiers types)

## Services
- [ ] services/*.ts (tous les fichiers services)

## Instructions pour le formatage

1. Pour chaque fichier :
   - [ ] Sauvegarder une copie de sauvegarde
   - [ ] Exécuter Prettier
   - [ ] Vérifier visuellement les changements
   - [ ] Tester les fonctionnalités
   - [ ] Cocher la case une fois validé

2. Commande pour formater un fichier :
   ```bash
   pnpm prettier --write chemin/vers/fichier
   ```

3. Commande pour vérifier un fichier :
   ```bash
   pnpm prettier --check chemin/vers/fichier
   ```

## Notes importantes
- Ne pas formater plusieurs fichiers à la fois
- Toujours tester après chaque formatage
- En cas de problème, restaurer la sauvegarde
- Mettre à jour cette liste au fur et à mesure
