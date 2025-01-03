# Architecture SL3

## Vue d'Ensemble

L'architecture de SL3 est conçue pour être modulaire, performante et maintenable, en utilisant les meilleures pratiques de développement moderne.

## Structure des Modules

### Organisation Standard

```
app/                        # Application Next.js
├── [feature]/             # Routes Next.js (ex: events)
│   ├── page.tsx           # Page principale de la feature
│   ├── layout.tsx         # Layout de la feature
│   └── [id]/             # Routes dynamiques (ex: [eventId])
│       ├── page.tsx
│       └── layout.tsx
├── api/                   # Routes API
└── i18n/                  # Traductions
    └── locales/
        ├── fr/
        │   ├── translation.json    # Traductions globales
        │   ├── components/         # Traductions des composants
        │   │   └── event-detail.json
        │   └── management/         # Traductions de gestion
        └── [lang]/                # Autres langues (en, de, it)
            ├── translation.json
            ├── components/
            └── management/

components/                # Composants React
├── [feature]/            # Composants spécifiques aux features
│   └── events/           # Exemple pour les événements
│       ├── event-detail/ # Composants de détail d'événement
│       │   ├── index.tsx     # Export des composants
│       │   ├── description.tsx
│       │   ├── hero-banner.tsx
│       │   ├── timeline.tsx
│       │   ├── speakers.tsx
│       │   └── rooms.tsx
│       └── event-list/   # Composants de liste d'événements
│           ├── index.tsx
│           └── filters.tsx
├── ui/                   # Composants UI réutilisables
└── shared/              # Composants partagés

store/                    # État global Zustand
├── feature.store.ts
└── index.ts

hooks/                    # Hooks personnalisés
└── use-feature.ts

services/                # Services métier
└── feature.service.ts

types/                   # Types globaux
└── index.ts
```

## Principes Fondamentaux

### Modularisation

La modularisation est un principe FONDAMENTAL de notre architecture. Tout fichier dépassant 300 lignes DOIT être divisé en modules plus petits.

#### Règles de Modularisation

1. **Limite de Taille**
   - Maximum 300 lignes par fichier
   - Inclut les imports et exports
   - Exclut les commentaires et documentation

2. **Stratégie de Division**
   - Séparer par responsabilité
   - Un module = une fonction principale
   - Maintenir la cohésion fonctionnelle
   - Éviter les dépendances circulaires

3. **Exemple de Modularisation pour les Events**

```typescript
// Structure des composants d'événements
components/events/
├── event-form/
│   ├── index.tsx           # Export principal
│   ├── form.tsx           # Formulaire principal
│   ├── metadata.tsx       # Gestion des métadonnées
│   ├── scheduling.tsx     # Planification
│   └── media.tsx          # Gestion des médias
├── event-list/
│   ├── index.tsx
│   ├── list.tsx
│   └── filters.tsx
└── event-detail/
    ├── index.tsx
    ├── hero-banner.tsx
    ├── description.tsx
    ├── timeline.tsx
    └── speakers.tsx

// Pages d'événements
app/events/
├── page.tsx               # Liste des événements
├── layout.tsx
└── [eventId]/
    ├── page.tsx          # Détail d'un événement
    └── layout.tsx
```

4. **Process de Refactoring**
   - Identifier les responsabilités distinctes
   - Créer une structure de dossiers appropriée
   - Extraire les composants logiques
   - Maintenir les tests unitaires
   - Documenter les dépendances

5. **Bonnes Pratiques**

   ```typescript
   // ❌ À éviter
   function BigComponent() {
     // 400+ lignes de code mélangé
   }

   // ✅ Préférer
   function EventSettings() {
     return (
       <>
         <EventForm />
         <EventMetadata />
         <EventScheduling />
         <EventMedia />
       </>
     );
   }
   ```

6. **Monitoring et Maintenance**
   - Utiliser ESLint pour détecter les fichiers trop grands
   - Review de code avec focus sur la taille
   - Refactoring proactif
   - Documentation des décisions de découpage

## Gestion d'État

### Stores Zustand

```typescript
interface FeatureState {
  items: Item[];
  isLoading: boolean;
  error: Error | null;

  // Actions
  fetchItems: () => Promise<void>;
  createItem: (data: CreateItemDTO) => Promise<void>;
  updateItem: (id: string, data: UpdateItemDTO) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export const useFeatureStore = create<FeatureState>(set => ({
  // Implémentation
}));
```

### Patterns de State

- Stores atomiques par feature
- Actions asynchrones avec gestion d'erreur
- Persistance sélective
- Hydration côté client

## Composants

### Structure Standard

```typescript
interface FeatureProps {
  // Props typées
}

export function Feature({ prop1, prop2 }: FeatureProps) {
  // Hooks en haut
  const { t } = useTranslation(['common', 'components/feature']);
  const store = useFeatureStore();

  // Handlers
  const handleAction = async () => {
    // Implementation
  };

  // JSX
  return (
    // Template
  );
}
```

### Bonnes Pratiques

- Composants fonctionnels uniquement
- Props typées obligatoires
- Séparation logique/présentation
- Tests unitaires
- Documentation TSDoc

## API Backend

### Controllers

```typescript
@Controller('api/v1/feature')
export class FeatureController {
  @Get()
  async findAll(): Promise<Feature[]> {
    // Implementation
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() dto: CreateFeatureDTO): Promise<Feature> {
    // Implementation
  }
}
```

### Services

```typescript
@Injectable()
export class FeatureService {
  constructor(
    @InjectModel(Feature.name)
    private featureModel: Model<Feature>
  ) {}

  async findAll(): Promise<Feature[]> {
    // Implementation
  }
}
```

### Validation

```typescript
export class CreateFeatureDTO {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
```

## Sécurité

### Authentication

- JWT pour l'API
- Sessions Redis
- Guards NestJS
- Middleware Next.js

### Authorization

- RBAC (Role Based Access Control)
- Guards par route
- Validation côté client et serveur

## Tests

### Frontend

```typescript
describe('Feature', () => {
  it('should render correctly', () => {
    render(<Feature />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
```

### Backend

```typescript
describe('FeatureService', () => {
  it('should create a feature', async () => {
    const result = await service.create(mockFeature);
    expect(result).toBeDefined();
  });
});
```

## Logging

### Frontend

- Console structuré
- Error Boundaries
- Analytics events

### Backend

- Winston logger
- Request logging
- Error tracking
- Audit logs

## Performance

### Optimisations Frontend

- Code splitting
- Image optimization
- Bundle analysis
- Lazy loading

### Optimisations Backend

- Query optimization
- Caching Redis
- Rate limiting
- Connection pooling

## Standards de Code

### Organisation du Code

- Fichiers limités à 300 lignes
- Modules autonomes et cohésifs
- Séparation claire des responsabilités
- Documentation des interfaces publiques

### Modularisation Progressive

1. **Identification**

   - Monitorer la taille des fichiers
   - Identifier les responsabilités
   - Noter les dépendances

2. **Planification**

   ```
   component/
   ├── README.md              # Documentation du découpage
   ├── ARCHITECTURE.md        # Décisions techniques
   └── modules/              # Sous-composants
   ```

3. **Exécution**

   - Créer la nouvelle structure
   - Migrer le code progressivement
   - Maintenir les tests
   - Valider les performances

4. **Validation**
   - Tests de régression
   - Review de performance
   - Documentation mise à jour
   - Approbation de l'équipe

### TypeScript

- Strict mode activé
- Types explicites
- Interfaces pour les objets
- Enums pour les constantes

### Style

- ESLint config stricte
- Prettier
- Import ordering
- Naming conventions
