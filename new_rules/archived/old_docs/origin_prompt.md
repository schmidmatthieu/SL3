# Instructions de Création - Swiss Live Event (SL3)

Créer une plateforme SaaS de streaming événementiel avec les spécifications suivantes :

## 1. Configuration Initiale
- Utiliser Next.js 15 pour le frontend avec TypeScript et Tailwind CSS
- Implémenter NestJS pour le backend avec Node.js 
- Configurer MongoDB comme base de données principale
- Mettre en place Redis pour le cache et les fonctionnalités temps réel
- Utiliser pnpm comme gestionnaire de paquets
- Suivre une architecture monorepo

## 2. Création des Fonctionnalités Principales

### Frontend
1. Créer quatre tableaux de bord distincts :
   - Dashboard administrateur général
   - Dashboard administrateur d'événement
   - Dashboard modérateur
   - Dashboard intervenant

2. Développer un lecteur vidéo personnalisé avec :
   - Support HLS
   - Sélection de qualité automatique
   - Sélection de pistes audio pour les langues
   - Contrôles de base (play/pause, volume, plein écran)

3. Implémenter un système de chat en temps réel avec :
   - Support de la modération
   - Filtrage automatique du contenu inapproprié
   - Gestion des messages privés

4. Créer un système de Q&A avec :
   - Soumission de questions
   - Modération des questions
   - Vote sur les questions
   - Réponses des intervenants

### Backend
1. Mettre en place l'API RESTful pour :
   - Gestion des utilisateurs
   - Gestion des événements
   - Gestion des sessions
   - Analytics

2. Implémenter les WebSockets pour :
   - Chat en temps réel
   - Mises à jour du statut de streaming
   - Notifications en temps réel
   - Synchronisation des votes

3. Configurer le système de streaming :
   - Gestion des flux HLS
   - Support multi-audio
   - Adaptation de la qualité
   - Enregistrement des sessions

## 3. Points Critiques à Respecter

### Sécurité
- Authentification JWT avec refresh tokens
- Autorisations basées sur les rôles (RBAC)
- Protection contre les attaques courantes
- Validation des entrées utilisateur

### Performance
- Optimisation des images et assets
- Mise en cache efficace
- Chargement différé des composants
- Optimisation des requêtes base de données

### Internationalisation
- Support minimum : Français, Anglais, Espagnol, Allemand et Italien
- Interface utilisateur multilingue
- Messages d'erreur traduits
- Support des fuseaux horaires

### Design
- Interface responsive
- Support thème clair/sombre
- Composants UI cohérents
- Design moderne et professionnel
- Utilisation des composant shadcn/ui

## 4. Ordre de Développement Recommandé

1. Mettre en place l'architecture de base frontend/backend
2. Développer le système d'authentification et d'autorisation
3. Créer les fonctionnalités de gestion d'événements
4. Implémenter le système de streaming
5. Développer les fonctionnalités temps réel (chat, Q&A)
6. Ajouter les analytics et le reporting
7. Implémenter l'internationalisation
8. Optimiser les performances et la sécurité
9. Ajouter les fonctionnalités avancées (paiement, etc.)
10. Effectuer les tests et le déploiement

## 5. Points Importants

- Suivre les standards de code définis dans la documentation
- Implémenter une couverture de tests complète
- Documenter le code et les API
- Maintenir la compatibilité entre les navigateurs
- Assurer la scalabilité de l'application

## 6. Éléments à Éviter

- Ne pas mélanger les responsabilités entre les services
- Éviter les dépendances inutiles
- Ne pas négliger la gestion des erreurs
- Ne pas compromettre la sécurité pour la facilité d'utilisation
- Ne pas ignorer les bonnes pratiques de performance

Suivre systématiquement la documentation technique détaillée fournie pour chaque composant spécifique.