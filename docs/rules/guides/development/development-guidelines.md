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
├── apps/
│   ├── web/                  # Application Next.js frontend
│   │   ├── app/             
│   │   │   ├── (auth)/     
│   │   │   │   ├── events/
│   │   │   │   │   ├── page.tsx          # Liste des événements
│   │   │   │   │   ├── create/           # Création d'événement
│   │   │   │   │   └── [slug]/           # Page d'événement
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       ├── layout.tsx
│   │   │   │   │       ├── event-page-client.tsx
│   │   │   │   │       ├── @modal/        # Modales contextuelles
│   │   │   │   │       ├── [roomSlug]/    # Page de room
│   │   │   │   │       │   ├── page.tsx
│   │   │   │   │       │   ├── room-content.tsx
│   │   │   │   │       │   ├── speaker/   # Vue speaker
│   │   │   │   │       │   └── mod/       # Vue modérateur
│   │   │   │   │       └── manage/        # Gestion événement
│   │   │   │   ├── admin/
│   │   │   │   └── profil-settings/
│   │   │   ├── (legal)/
│   │   │   ├── (marketing)/
│   │   │   └── i18n/
│   │   ├── components/
│   │   │   ├── core/
│   │   │   │   ├── layout/
│   │   │   │   ├── ui/
│   │   │   │   └── shared/
│   │   │   ├── features/
│   │   │   │   ├── events-global/        # Composants événements
│   │   │   │   ├── rooms-global/         # Composants rooms
│   │   │   │   │   ├── room-detail/     
│   │   │   │   │   │   ├── stream/      
│   │   │   │   │   │   ├── chat/        
│   │   │   │   │   │   ├── qa-section/
│   │   │   │   │   │   ├── files-section/
│   │   │   │   │   │   └── votes-section/
│   │   │   │   └── users/
│   │   │   └── pages/
│   │   ├── lib/
│   │   │   ├── store/
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   └── types/
│   └── api/                  # Backend NestJS

# Structure d'une Feature
components/features/[feature-name]/
├── [component-name]/       # Un dossier par composant majeur
│   ├── index.tsx          # Export principal
│   ├── component-name.tsx # Si plus de 300 lignes
│   ├── sub-components/    # Sous-composants si nécessaire
│   │   ├── part-one.tsx
│   │   └── part-two.tsx
│   └── __tests__/        # Tests unitaires
└── ui/                    # Composants UI réutilisables
```

#### Conventions de Nommage

```typescript
// Composants
ComponentName/
├── index.tsx              # Export principal
├── component-name.tsx     # Si plus de 300 lignes
├── sub-components/
│   ├── part-one.tsx
│   └── part-two.tsx
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
   - Vérifier la cohérence avec l'architecture

2. **Implémentation**
   - Créer la structure de base
   - Développer les composants atomiques
   - Intégrer les modules
   - Ajouter les tests
   - Respecter la limite de 300 lignes

3. **Review**
   - Vérifier la taille des fichiers
   - Valider la modularité
   - Tester les performances
   - Documenter les choix
   - Vérifier l'accessibilité

### 4. Gestion des États

#### Zustand Store

```typescript
// lib/store/feature.store.ts
interface FeatureState {
  // État
  data: FeatureData;
  status: 'idle' | 'loading' | 'error';
  
  // Actions
  fetch: () => Promise<void>;
  update: (data: Partial<FeatureData>) => void;
  reset: () => void;
}

const useFeatureStore = create<FeatureState>((set) => ({
  // Implémentation
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
