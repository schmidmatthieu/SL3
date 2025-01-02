# Guide d'Ajout des Traductions

## Structure des Traductions

Notre application utilise une approche modulaire pour les traductions, organisée par composant. Cette structure permet une meilleure maintenabilité et une gestion plus efficace des traductions.

### Organisation des Fichiers

```
/app/i18n/
  ├── locales/
  │   ├── fr/
  │   │   ├── common.json        # Traductions communes
  │   │   ├── components/        # Traductions spécifiques aux composants
  │   │   │   ├── event-settings.json
  │   │   │   ├── media-management.json
  │   │   │   └── ...
  │   ├── en/
  │   │   ├── common.json
  │   │   ├── components/
  │   │   │   └── ...
  │   ├── de/
  │   │   ├── common.json
  │   │   ├── components/
  │   │   │   └── ...
  │   └── it/
  │       ├── common.json
  │       └── components/
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

### 2. Utilisation dans les Composants

```typescript
import { useTranslation } from 'react-i18next';

export function MonComposant() {
  // Charger les traductions communes et spécifiques au composant
  const { t } = useTranslation(['common', 'components/mon-composant']);

  return (
    <div>
      {/* Utiliser les traductions spécifiques au composant */}
      <h1>{t('components/mon-composant:title')}</h1>
      <p>{t('components/mon-composant:description')}</p>
      
      {/* Utiliser les traductions communes */}
      <button>{t('common:buttons.save')}</button>
    </div>
  );
}
```

### 3. Éléments Communs

Le fichier `common.json` contient les traductions partagées:

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

2. **Nommage des Clés**
   - Utiliser des noms explicites
   - Suivre une structure hiérarchique
   - Éviter les espaces et caractères spéciaux

3. **Maintenance**
   - Maintenir tous les fichiers de langue synchronisés
   - Documenter les changements importants
   - Supprimer les clés non utilisées

4. **Performance**
   - Charger uniquement les traductions nécessaires
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
  │   ├── common.json
  │   └── components/
  │       └── event-settings.json
  ├── en/
  │   ├── common.json
  │   └── components/
  │       └── event-settings.json
  └── ...
```

### Implémentation
```typescript
import { useTranslation } from 'react-i18next';

export function EventSettings() {
  const { t } = useTranslation(['common', 'components/event-settings']);

  return (
    <div>
      <h1>{t('components/event-settings:title')}</h1>
      
      <form>
        <label>{t('components/event-settings:form.name')}</label>
        <input type="text" />
        
        <div className="actions">
          <button type="submit">
            {t('common:buttons.save')}
          </button>
          <button type="button">
            {t('common:buttons.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
```

## Ressources Utiles

- Documentation i18next : [https://www.i18next.com/](https://www.i18next.com/)
- Structure des traductions du projet : `/app/i18n/locales/`
