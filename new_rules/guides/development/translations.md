# Guide d'Ajout des Traductions

## Structure des Traductions

Notre application utilise une approche modulaire pour les traductions, organisée par composant. Cette structure permet une meilleure maintenabilité et une gestion plus efficace des traductions.

### Organisation des Fichiers

```
/app/i18n/
  ├── locales/
  │   ├── fr/
  │   │   ├── translation.json     # Traductions globales
  │   │   ├── components/          # Traductions spécifiques aux composants
  │   │   │   ├── event-detail.json
  │   │   │   └── ...
  │   │   └── management/          # Traductions pour la gestion
  │   │       └── ...
  │   ├── en/
  │   │   ├── translation.json
  │   │   ├── components/
  │   │   │   └── ...
  │   │   └── management/
  │   │       └── ...
  │   ├── de/
  │   │   ├── translation.json
  │   │   ├── components/
  │   │   │   └── ...
  │   │   └── management/
  │   │       └── ...
  │   └── it/
  │       ├── translation.json
  │       ├── components/
  │       │   └── ...
  │       └── management/
  │           └── ...
```

## Processus d'Ajout de Traductions

### 1. Pour un Nouveau Composant

1. Créer un nouveau fichier de traduction pour chaque langue dans le dossier `components/`:

   ```bash
   touch app/i18n/locales/fr/components/mon-composant.json
   touch app/i18n/locales/en/components/mon-composant.json
   touch app/i18n/locales/de/components/mon-composant.json
   touch app/i18n/locales/it/components/mon-composant.json
   ```

2. Structure recommandée pour le fichier de traduction du composant:
   ```json
   {
     "title": "Titre du Composant",
     "description": "Description du composant",
     "actions": {
       "submit": "Soumettre",
       "cancel": "Annuler"
     },
     "messages": {
       "success": "Opération réussie",
       "error": "Une erreur est survenue"
     }
   }
   ```

3. Ajouter le namespace dans la configuration i18n (`app/i18n.ts`):
   ```typescript
   const translations = languages.reduce(
     (acc, lang) => {
       acc[lang] = {
         translation: require(`./i18n/locales/${lang}/translation.json`),
         'components/mon-composant': require(`./i18n/locales/${lang}/components/mon-composant.json`),
       };
       return acc;
     },
     {} as Record<string, { translation: any; 'components/mon-composant': any }>
   );
   ```

### 2. Utilisation dans les Composants

```typescript
import { useTranslation } from 'react-i18next';

export function MonComposant() {
  // Utiliser le namespace spécifique au composant
  const { t } = useTranslation('components/mon-composant');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <button>{t('actions.submit')}</button>
    </div>
  );
}
```

### 3. Traductions Globales

Le fichier `translation.json` contient les traductions globales:

```json
{
  "buttons": {
    "save": "Sauvegarder",
    "cancel": "Annuler",
    "delete": "Supprimer"
  },
  "messages": {
    "confirmDelete": "Êtes-vous sûr de vouloir supprimer ?",
    "success": "Opération réussie",
    "error": "Une erreur est survenue"
  },
  "labels": {
    "name": "Nom",
    "email": "Email",
    "phone": "Téléphone"
  }
}
```

## Bonnes Pratiques

1. **Organisation**
   - Créer un fichier de traduction par composant
   - Utiliser des clés descriptives et cohérentes
   - Grouper les traductions par contexte
   - Placer les traductions globales dans `translation.json`

2. **Nommage des Clés**
   - Utiliser des noms explicites
   - Suivre une structure hiérarchique
   - Éviter les espaces et caractères spéciaux

3. **Maintenance**
   - Maintenir tous les fichiers de langue synchronisés
   - Documenter les changements importants
   - Supprimer les clés non utilisées

4. **Performance**
   - Charger uniquement les namespaces nécessaires
   - Utiliser le lazy loading quand possible
   - Éviter les traductions redondantes

## Langues Supportées

- 🇫🇷 Français (fr) - Langue principale
- 🇬🇧 Anglais (en)
- 🇩🇪 Allemand (de)
- 🇮🇹 Italien (it)

## Exemple Complet

### Structure de Fichiers

```
/app/i18n/locales/
  ├── fr/
  │   ├── translation.json
  │   └── components/
  │       └── event-detail.json
  ├── en/
  │   ├── translation.json
  │   └── components/
  │       └── event-detail.json
  └── ...
```

### Implémentation

```typescript
import { useTranslation } from 'react-i18next';

export function EventDetail() {
  const { t } = useTranslation('components/event-detail');

  return (
    <div>
      <h1>{t('title')}</h1>
      <div className="description">
        {t('description')}
      </div>
      <div className="actions">
        <button>{t('actions.register')}</button>
        <button>{t('actions.share')}</button>
      </div>
    </div>
  );
}
```

## Ressources Utiles

- Documentation i18next : [https://www.i18next.com/](https://www.i18next.com/)
- Structure des traductions du projet : `/app/i18n/locales/`
