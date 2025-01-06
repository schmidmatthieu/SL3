# Guide d'Internationalisation (i18n)

## Structure des Traductions

### Organisation Modulaire

```
i18n/
├── locales/
│   ├── fr/
│   │   ├── translation.json       # Traductions globales
│   │   ├── components/           # Traductions spécifiques aux composants
│   │   │   └── event-detail.json
│   │   └── management/          # Traductions pour la gestion
│   ├── en/
│   │   ├── translation.json
│   │   ├── components/
│   │   └── management/
│   ├── de/
│   │   ├── translation.json
│   │   ├── components/
│   │   └── management/
│   └── it/
│       ├── translation.json
│       ├── components/
│       └── management/
└── settings.ts
```

### Règles de Nommage

- Fichiers : kebab-case (ex: event-detail.json)
- Clés : camelCase
- Namespaces : utiliser le chemin complet (ex: 'components/event-detail')

## Configuration

### Setup i18next

```typescript
// i18n.ts
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { fallbackLng, languages } from './i18n/settings';

// Import all translations
const translations = languages.reduce(
  (acc, lang) => {
    acc[lang] = {
      translation: require(`./i18n/locales/${lang}/translation.json`),
      'components/event-detail': require(`./i18n/locales/${lang}/components/event-detail.json`),
    };
    return acc;
  },
  {} as Record<string, { translation: any; 'components/event-detail': any }>
);

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: process.env.NODE_ENV === 'development',
    fallbackLng,
    supportedLngs: languages,
    defaultNS: 'translation',
    ns: ['translation', 'components/event-detail'],
    interpolation: {
      escapeValue: false,
    },
    resources: translations,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });
```

## Structure des Fichiers

### Traductions Globales

```json
// translation.json
{
  "actions": {
    "save": "Sauvegarder",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "edit": "Modifier"
  },
  "messages": {
    "success": "Opération réussie",
    "error": "Une erreur est survenue",
    "loading": "Chargement en cours"
  },
  "validation": {
    "required": "Ce champ est requis",
    "email": "Email invalide",
    "minLength": "Minimum {{count}} caractères"
  }
}
```

### Composants

```json
// components/event-detail.json
{
  "title": "Détails de l'événement",
  "description": "Description de l'événement",
  "actions": {
    "register": "S'inscrire",
    "share": "Partager"
  },
  "sections": {
    "speakers": "Intervenants",
    "schedule": "Programme",
    "location": "Lieu"
  }
}
```

## Utilisation

### Dans les Composants

```typescript
// components/events/event-detail/description.tsx
function EventDescription() {
  const { t } = useTranslation('components/event-detail');

  return (
    <div>
      <h2>{t('title')}</h2>
      <p>{t('description')}</p>
      <div className="actions">
        <button>{t('actions.register')}</button>
        <button>{t('actions.share')}</button>
      </div>
    </div>
  );
}
```

### Variables

```typescript
// Utilisation avec variables
t('validation.minLength', { count: 3 });
```

## Bonnes Pratiques

### 1. Modularité

- Un fichier par composant majeur
- Regrouper les traductions par fonctionnalité
- Utiliser le fichier translation.json pour les éléments globaux

### 2. Maintenance

- Garder les clés cohérentes
- Documenter les variables
- Vérifier les traductions manquantes

### 3. Performance

- Charger uniquement les namespaces nécessaires
- Mettre en cache les traductions
- Optimiser la taille des fichiers

### 4. Tests

```typescript
describe('Translations', () => {
  it('should load component translations', async () => {
    const translations = await import('@/i18n/locales/fr/components/event-detail.json');
    expect(translations).toBeDefined();
  });
});
```

## Gestion des Erreurs

### Messages Manquants

```typescript
// Fallback pour les clés manquantes
const handleMissingKey = (key: string, namespace: string) => {
  console.warn(`Missing translation: ${namespace}:${key}`);
  return key;
};
```

### Validation Runtime

```typescript
// Vérifier les traductions au runtime
const validateTranslationKey = (key: string, namespace: string) => {
  if (!translations[namespace]?.[key]) {
    console.error(`Invalid translation key: ${namespace}:${key}`);
  }
};
```

## SEO et Accessibilité

### Meta Tags

```typescript
// app/[locale]/layout.tsx
export const metadata = {
  title: t('meta.title'),
  description: t('meta.description'),
};
```

### Attributs HTML

```tsx
function LocalizedComponent() {
  const { locale } = useLocale();

  return (
    <div lang={locale} dir={getDirection(locale)}>
      {/* Contenu */}
    </div>
  );
}
