# Template de Composant

## Description

[Description brève du composant et de son objectif]

## Props

```typescript
interface ComponentProps {
  // Props avec leurs types et descriptions
}
```

## Structure

```tsx
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Hooks et logique
  const { t } = useTranslation('components/component-name');

  return (
    // JSX avec traductions
    <div>
      <h2>{t('title')}</h2>
      <p>{t('description')}</p>
      <div className="actions">
        <button>{t('actions.submit')}</button>
        <button>{t('actions.cancel')}</button>
      </div>
    </div>
  );
}
```

## Styles

```typescript
// Styles Tailwind et variants
```

## Traductions

1. Ajouter le fichier de traduction pour chaque langue :
```bash
touch app/i18n/locales/fr/components/component-name.json
touch app/i18n/locales/en/components/component-name.json
touch app/i18n/locales/de/components/component-name.json
touch app/i18n/locales/it/components/component-name.json
```

2. Structure du fichier de traduction :
```json
// app/i18n/locales/[lang]/components/component-name.json
{
  "title": "",
  "description": "",
  "actions": {
    "submit": "",
    "cancel": ""
  }
}
```

3. Ajouter le namespace dans i18n.ts :
```typescript
const translations = languages.reduce(
  (acc, lang) => {
    acc[lang] = {
      translation: require(`./i18n/locales/${lang}/translation.json`),
      'components/component-name': require(`./i18n/locales/${lang}/components/component-name.json`),
    };
    return acc;
  },
  {} as Record<string, { translation: any; 'components/component-name': any }>
);
```

## Tests

```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Test cases
  });
});
```

## Accessibilité

- [ ] Rôles ARIA appropriés
- [ ] Support clavier
- [ ] Contraste suffisant
- [ ] Labels explicites

## Responsive Design

- [ ] Mobile first
- [ ] Breakpoints standards
- [ ] Touch targets adaptés
- [ ] Layout fluide

## Performance

- [ ] Lazy loading si nécessaire
- [ ] Optimisation des re-renders
- [ ] Gestion des états optimisée
- [ ] Bundle size considéré

## Documentation

- [ ] Props documentées
- [ ] Exemples d'utilisation
- [ ] Cas particuliers notés
- [ ] Dépendances listées
