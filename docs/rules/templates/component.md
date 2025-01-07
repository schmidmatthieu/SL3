# Template de Composant

## Description

[Description brève du composant et de son objectif]

## Props

```typescript
interface ComponentNameProps {
  // Props avec leurs types et descriptions
}
```

## Structure

```typescript
// apps/web/components/features/[feature-name]/[component-name]/index.tsx

import { useTranslation } from 'next-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/core/ui/button';

export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  const { t } = useTranslation('components/feature-name/component-name');

  return (
    <div className={cn('component-base-class', 'variant-class')}>
      <h2 className="text-2xl font-bold">{t('title')}</h2>
      <p className="text-muted-foreground">{t('description')}</p>
      <div className="flex gap-2">
        <Button variant="default">{t('actions.submit')}</Button>
        <Button variant="outline">{t('actions.cancel')}</Button>
      </div>
    </div>
  );
}
```

## Organisation des Fichiers

```
apps/web/components/features/[feature-name]/
└── [component-name]/
    ├── index.tsx           # Composant principal
    ├── component-name.tsx  # Si plus de 300 lignes
    ├── sub-components/    # Si nécessaire
    │   ├── part-one.tsx
    │   └── part-two.tsx
    └── __tests__/
        └── index.test.tsx
```

## Traductions

1. Structure des fichiers :
```
apps/web/app/i18n/locales/
├── fr/
│   └── components/
│       └── feature-name/
│           └── component-name.json
├── en/
├── de/
└── it/
```

2. Contenu du fichier de traduction :
```json
{
  "title": "",
  "description": "",
  "actions": {
    "submit": "",
    "cancel": ""
  },
  "errors": {
    "required": "",
    "invalid": ""
  }
}
```

## Styles

```typescript
// Utilisation de Tailwind avec shadcn/ui
const styles = {
  base: 'space-y-4 p-4 rounded-lg border',
  variants: {
    primary: 'bg-background text-foreground',
    secondary: 'bg-muted text-muted-foreground'
  }
};
```

## Tests

```typescript
import { render, screen } from '@testing-library/react';
import { ComponentName } from './index';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
```

## Accessibilité

- [ ] Utiliser les composants shadcn/ui pour l'accessibilité de base
- [ ] Ajouter des rôles ARIA appropriés
- [ ] Assurer le support clavier
- [ ] Vérifier le contraste avec les variables Tailwind
- [ ] Utiliser des labels explicites
- [ ] Tester avec les lecteurs d'écran

## Responsive Design

- [ ] Mobile first avec les classes Tailwind
- [ ] Utiliser les breakpoints standards :
  ```typescript
  sm: '640px'
  md: '768px'
  lg: '1024px'
  xl: '1280px'
  2xl: '1536px'
  ```
- [ ] Touch targets min 44px
- [ ] Layout fluide avec grid/flex
- [ ] Images responsives avec next/image

## Performance

- [ ] Lazy loading si nécessaire
- [ ] Optimisation des re-renders
- [ ] Memoization des callbacks
- [ ] Optimisation des images
- [ ] Gestion des suspense boundaries

## Documentation

- [ ] Props documentées
- [ ] Exemples d'utilisation
- [ ] Cas particuliers notés
- [ ] Dépendances listées
