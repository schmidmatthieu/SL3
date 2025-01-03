# Guide de Développement SL3

## Principes de Base

### 1. Modularité

- Limite stricte de 300 lignes par fichier
- Séparation des responsabilités
- Composants atomiques et réutilisables
- Documentation claire des interfaces

### 2. Organisation du Code

#### Structure des Modules

```
# Structure Globale du Projet
/
├── app/                    # Routes et pages Next.js
│   └── [feature]/         # Pages et layouts par feature
│       ├── page.tsx       # Page principale
│       ├── layout.tsx     # Layout de la feature
│       └── [id]/          # Routes dynamiques
│           ├── page.tsx
│           └── layout.tsx
├── components/            # Composants React
│   └── [feature]/        # Composants par feature
│       ├── [component]/   # Dossier par composant majeur
│       │   ├── index.tsx  # Export principal
│       │   └── sub-components/ # Sous-composants
│       └── ui/           # Composants UI réutilisables
├── lib/                  # Utilitaires et helpers
├── hooks/                # Custom hooks React
├── store/               # Stores Zustand
├── types/               # Types TypeScript
└── utils/               # Utilitaires généraux

# Structure d'une Feature
components/[feature]/
├── [component]/          # Un dossier par composant majeur
│   ├── index.tsx        # Export principal
│   ├── types.ts         # Types du composant
│   ├── hooks.ts         # Hooks spécifiques
│   ├── utils.ts         # Utilitaires
│   └── __tests__/       # Tests unitaires
└── ui/                  # Composants UI réutilisables
```

#### Conventions de Nommage

```typescript
// Composants
ComponentName/
├── index.tsx
├── types.ts
├── hooks.ts
├── utils.ts
└── __tests__/
    └── index.test.tsx

// Modules
feature-name/
├── components/
│   ├── feature-list/
│   │   └── index.tsx
│   └── feature-item/
│       └── index.tsx
└── hooks/
    └── use-feature.ts
```

### 3. Développement par Fonctionnalité

#### Process

1. **Planification**

   - Définir les responsabilités
   - Identifier les composants nécessaires
   - Planifier la structure des modules

2. **Implémentation**

   - Créer la structure de base
   - Développer les composants atomiques
   - Intégrer les modules
   - Ajouter les tests

3. **Review**
   - Vérifier la taille des fichiers
   - Valider la modularité
   - Tester les performances
   - Documenter les choix

### 4. Gestion des États

#### Zustand Store

```typescript
// stores/feature.store.ts
interface FeatureState {
  data: FeatureData[];
  isLoading: boolean;
  error: Error | null;
}

// Séparation en petits stores
const useFeatureStore = create<FeatureState>(set => ({
  data: [],
  isLoading: false,
  error: null,

  // Actions atomiques
  setData: data => set({ data }),
  setLoading: isLoading => set({ isLoading }),
  setError: error => set({ error }),
}));
```

### 5. Composants

#### Structure Type

```typescript
// components/feature-component/index.tsx
interface Props {
  // Props typées
}

export function FeatureComponent({ prop1, prop2 }: Props) {
  // 1. Hooks
  const { t } = useTranslation();
  const store = useFeatureStore();

  // 2. Dérivations
  const computed = useMemo(() => {
    // Calculs
  }, [dependencies]);

  // 3. Handlers
  const handleAction = useCallback(() => {
    // Actions
  }, [dependencies]);

  // 4. Render
  return (
    // JSX
  );
}
```

### 6. Tests

#### Structure des Tests

```typescript
// components/feature-component/feature.test.tsx
describe('FeatureComponent', () => {
  // Tests unitaires par fonctionnalité
  describe('when rendering', () => {
    it('should display correctly', () => {
      // Test
    });
  });

  describe('when interacting', () => {
    it('should handle actions', () => {
      // Test
    });
  });
});
```

### 7. Documentation

#### JSDoc

````typescript
/**
 * @component FeatureComponent
 * @description Description du composant
 *
 * @modularization
 * - Composant divisé en sous-modules :
 *   - FeatureList : Liste des éléments
 *   - FeatureItem : Item individuel
 *
 * @example
 * ```tsx
 * <FeatureComponent data={data} />
 * ```
 */
````

### 8. Performance

#### Optimisations

- Utilisation de `useMemo` et `useCallback`
- Lazy loading des composants lourds
- Pagination des listes
- Mise en cache des requêtes

```typescript
// Exemple de lazy loading
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### 9. Accessibilité

#### Checklist

- Labels explicites
- Rôles ARIA appropriés
- Support clavier
- Contraste suffisant
- Messages d'erreur clairs

### 10. Internationalisation

#### Structure

```
locales/
├── fr/
│   ├── translation.json         # Traductions globales
│   ├── components/             # Traductions des composants
│   │   └── event-detail.json
│   └── management/            # Traductions de gestion
└── [lang]/                    # Autres langues (en, de, it)
    ├── translation.json
    ├── components/
    └── management/
```

### 11. Git

#### Commits

```bash
# Format
type(scope): description

# Types
feat: nouvelle fonctionnalité
fix: correction de bug
refactor: refactoring
style: changements de style
docs: documentation
test: ajout/modification de tests
```

### 12. Review de Code

#### Checklist

- Taille des fichiers < 300 lignes
- Tests unitaires présents
- Documentation à jour
- Performance optimisée
- Accessibilité vérifiée
- Traductions complètes
