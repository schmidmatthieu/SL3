# Guide de Tests

## Principes de Base

### Structure Modulaire

- Tests unitaires par module < 300 lignes
- Tests d'intégration par feature
- Tests E2E pour les flows critiques

## Tests Unitaires

### Structure

```typescript
// components/[feature]/[component]/__tests__/index.test.tsx
describe('ComponentName', () => {
  // Grouper par fonctionnalité
  describe('rendering', () => {
    it('should render correctly', () => {
      render(<Component />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should handle click', () => {
      const onClickMock = jest.fn();
      render(<Component onClick={onClickMock} />);
      fireEvent.click(screen.getByRole('button'));
      expect(onClickMock).toHaveBeenCalled();
    });
  });
});
```

### Structure des Tests

```
components/[feature]/
└── [component]/
    ├── index.tsx
    ├── types.ts
    ├── hooks.ts
    └── __tests__/          # Dossier de tests
        ├── index.test.tsx  # Tests du composant principal
        ├── hooks.test.ts   # Tests des hooks
        └── utils.test.ts   # Tests des utilitaires
```

### Bonnes Pratiques

- Un fichier de test par module
- Tests isolés et indépendants
- Mocks pour les dépendances externes
- Coverage minimum de 80%

## Tests d'Intégration

### Structure

```typescript
// feature.integration.test.tsx
describe('FeatureIntegration', () => {
  beforeAll(async () => {
    // Setup
  });

  afterAll(async () => {
    // Cleanup
  });

  it('should complete the flow', async () => {
    // Test du flow complet
  });
});
```

### Patterns

- Tests de flux complets
- Intégration avec l'API
- Tests de state management
- Tests de routing

## Tests E2E

### Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
});
```

### Structure

```typescript
// feature.spec.ts
test('complete user flow', async ({ page }) => {
  // Steps
  await page.goto('/');
  await page.click('[data-testid="button"]');
  await expect(page.locator('h1')).toHaveText('Success');
});
```

## Tests de Performance

### Métriques

- First Contentful Paint < 1.8s
- Time to Interactive < 3.8s
- Total Blocking Time < 200ms
- Cumulative Layout Shift < 0.1

### Outils

```typescript
// lighthouse.config.js
module.exports = {
  performance: 90,
  accessibility: 90,
  'best-practices': 90,
  seo: 90,
};
```

## Tests API

### Structure

```typescript
// endpoint.test.ts
describe('API Endpoint', () => {
  it('should return correct data', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchSchema(schema);
  });
});
```

## Tests de State

### Zustand Store

```typescript
// store.test.ts
describe('FeatureStore', () => {
  it('should update state', () => {
    const store = useFeatureStore.getState();
    store.updateData(newData);
    expect(store.data).toEqual(newData);
  });
});
```

## Tests de Composants

### Composants Isolés

```typescript
// component.test.tsx
describe('Component', () => {
  it('should handle props correctly', () => {
    const { rerender } = render(<Component prop={value} />);
    expect(screen.getByText(value)).toBeInTheDocument();

    rerender(<Component prop={newValue} />);
    expect(screen.getByText(newValue)).toBeInTheDocument();
  });
});
```

## Mocks et Stubs

### API Mocks

```typescript
// api.mock.ts
export const mockApi = {
  getData: jest.fn().mockResolvedValue(mockData),
  updateData: jest.fn().mockResolvedValue({ success: true }),
};
```

### Store Mocks

```typescript
// store.mock.ts
export const mockStore = {
  getState: () => ({
    data: mockData,
    isLoading: false,
  }),
  setState: jest.fn(),
};
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
```

## Documentation des Tests

### JSDoc

```typescript
/**
 * @jest-environment jsdom
 * @group unit
 * @group integration
 */
describe('Feature', () => {
  // Tests
});
```

## Monitoring et Reporting

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
