# Guide d'Internationalisation (i18n)

## Structure des Traductions

### Organisation Modulaire

```
i18n/
├── locales/
│   ├── fr/
│   │   ├── common.json
│   │   └── components/
│   │       ├── event-settings/
│   │       │   ├── form.json
│   │       │   └── validation.json
│   │       └── media-manager/
│   │           ├── upload.json
│   │           └── gallery.json
│   ├── en/
│   ├── de/
│   └── it/
└── config.ts
```

### Règles de Nommage

- Fichiers : kebab-case
- Clés : camelCase
- Namespaces : dot.notation

## Configuration

### Setup i18next

```typescript
// i18n/config.ts
export const i18nConfig = {
  defaultLocale: 'fr',
  locales: ['fr', 'en', 'de', 'it'],
  namespaces: ['common', 'components'],
  defaultNamespace: 'common',
};
```

### Chargement Dynamique

```typescript
// Chargement des traductions par module
const loadTranslations = async (locale: string, component: string) => {
  const module = await import(`@/i18n/locales/${locale}/components/${component}`);
  return module.default;
};
```

## Structure des Fichiers

### Common

```json
// common.json
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
// components/event-settings/form.json
{
  "title": "Paramètres de l'événement",
  "fields": {
    "name": {
      "label": "Nom de l'événement",
      "placeholder": "Entrez le nom"
    },
    "description": {
      "label": "Description",
      "placeholder": "Décrivez votre événement"
    }
  }
}
```

## Utilisation

### Dans les Composants

```typescript
// components/event-settings/event-form.tsx
function EventForm() {
  const { t } = useTranslation([
    'common',
    'components.event-settings.form'
  ]);

  return (
    <form>
      <h2>{t('components.event-settings.form:title')}</h2>
      <Input
        label={t('components.event-settings.form:fields.name.label')}
        placeholder={t('components.event-settings.form:fields.name.placeholder')}
      />
      {/* ... */}
    </form>
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

- Un fichier par composant/module
- Séparer les validations
- Grouper les messages communs

### 2. Maintenance

- Garder les clés cohérentes
- Documenter les variables
- Vérifier les traductions manquantes

### 3. Performance

- Charger les traductions à la demande
- Mettre en cache les traductions
- Optimiser la taille des fichiers

### 4. Tests

```typescript
describe('Translations', () => {
  it('should load component translations', async () => {
    const translations = await loadTranslations('fr', 'event-settings');
    expect(translations).toBeDefined();
  });
});
```

## Processus de Traduction

### 1. Extraction

```bash
# Extraire les clés de traduction
i18next-extract 'src/**/*.{ts,tsx}'
```

### 2. Validation

```typescript
// utils/validateTranslations.ts
const validateTranslations = (locale: string, reference: string = 'fr') => {
  // Vérifier les clés manquantes
};
```

### 3. Import/Export

```typescript
// utils/exportTranslations.ts
const exportTranslations = async (locale: string) => {
  // Export au format XLSX/CSV
};
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
```
