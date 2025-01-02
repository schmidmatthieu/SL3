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

  return (
    // JSX
  );
}
```

## Styles

```typescript
// Styles Tailwind et variants
```

## Traductions

```json
// components/component-name.json
{
  "title": "",
  "description": "",
  "actions": {
    "submit": "",
    "cancel": ""
  }
}
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
