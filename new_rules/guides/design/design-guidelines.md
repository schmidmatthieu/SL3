# Guide de Design SL3

## Principes Fondamentaux

### 1. Modularité UI

- Composants atomiques < 300 lignes
- Styles réutilisables
- Variants Tailwind
- Composants shadcn/ui

### 2. Système de Design

#### Couleurs

```typescript
// tailwind.config.ts
const colors = {
  primary: {
    DEFAULT: '#...',
    light: '#...',
    dark: '#...',
  },
  secondary: {
    DEFAULT: '#...',
    light: '#...',
    dark: '#...',
  },
  // ...
};
```

#### Typographie

```typescript
// tailwind.config.ts
const typography = {
  fontFamily: {
    sans: ['Inter', 'sans-serif'],
    mono: ['Fira Code', 'monospace'],
  },
  fontSize: {
    // ...
  },
};
```

#### Espacement

```typescript
const spacing = {
  // Système d'espacement cohérent
};
```

### 3. Composants UI

#### Structure Modulaire

```
components/
├── ui/                    # Composants UI réutilisables
│   ├── button/
│   │   ├── index.tsx     # Export principal
│   │   ├── types.ts      # Types du composant
│   │   └── __tests__/    # Tests unitaires
│   ├── input/
│   │   └── index.tsx
│   └── form/
│       ├── index.tsx
│       └── field.tsx
└── [feature]/            # Composants spécifiques aux features
    └── [component]/
        ├── index.tsx
        └── sub-components/
```

#### Variants

```typescript
// components/ui/button/index.tsx
const buttonVariants = cva('inline-flex items-center justify-center', {
  variants: {
    variant: {
      default: 'bg-primary',
      secondary: 'bg-secondary',
      ghost: 'hover:bg-muted',
    },
    size: {
      default: 'h-10 px-4',
      sm: 'h-8 px-3',
      lg: 'h-12 px-6',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});
```

### 4. Responsive Design

#### Breakpoints

```typescript
// tailwind.config.ts
const screens = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};
```

#### Mobile First

```tsx
// Exemple de composant responsive
function ResponsiveComponent() {
  return (
    <div
      className="
      grid
      grid-cols-1
      md:grid-cols-2
      lg:grid-cols-3
      gap-4
      p-4
      md:p-6
      lg:p-8
    "
    >
      {/* Contenu */}
    </div>
  );
}
```

### 5. Accessibilité

#### Contraste

- Ratio minimum : 4.5:1
- Texte large : 3:1
- Éléments décoratifs : pas de minimum

#### Navigation Clavier

```tsx
function AccessibleComponent() {
  return (
    <button
      role="button"
      tabIndex={0}
      aria-label="Action description"
      className="focus-visible:ring-2"
    >
      {/* Contenu */}
    </button>
  );
}
```

### 6. Dark Mode

#### Configuration

```typescript
// tailwind.config.ts
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'hsl(var(--background))',
          dark: 'hsl(var(--background-dark))',
        },
      },
    },
  },
};
```

#### Utilisation

```tsx
function ThemeAwareComponent() {
  return (
    <div
      className="
      bg-background
      dark:bg-background-dark
      text-foreground
      dark:text-foreground-dark
    "
    >
      {/* Contenu */}
    </div>
  );
}
```

### 7. Animation et Transitions

#### Configuration

```typescript
// tailwind.config.ts
const animation = {
  keyframes: {
    slideIn: {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(0)' },
    },
  },
  animation: {
    slideIn: 'slideIn 200ms ease-out',
  },
};
```

#### Utilisation

```tsx
function AnimatedComponent() {
  return (
    <div
      className="
      animate-slideIn
      transition-all
      duration-200
      ease-out
    "
    >
      {/* Contenu */}
    </div>
  );
}
```

### 8. Performance UI

#### Optimisations

- Lazy loading des images
- Skeleton loading
- Virtualization des listes
- Debounce des inputs

```tsx
// Exemple de skeleton
function SkeletonLoader() {
  return (
    <div
      className="
      animate-pulse
      bg-muted
      rounded-md
      h-32
      w-full
    "
    />
  );
}
```

### 9. SEO et Métadonnées

#### Configuration

```tsx
// app/layout.tsx
export const metadata = {
  title: {
    default: 'SL3',
    template: '%s | SL3',
  },
  description: 'Swiss Live Event Platform',
  keywords: ['streaming', 'events', 'live'],
};
```

### 10. Internationalisation UI

#### Direction RTL

```tsx
function RTLAwareComponent() {
  return (
    <div
      className="
      rtl:space-x-reverse
      rtl:text-right
      ltr:text-left
    "
    >
      {/* Contenu */}
    </div>
  );
}
```

### 11. Tests UI

#### Structure

```typescript
// component.test.tsx
describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle interactions', () => {
    render(<Component />);
    fireEvent.click(screen.getByRole('button'));
    // Assertions
  });
});
```

### 12. Documentation UI

#### Storybook

```typescript
// component.stories.tsx
export default {
  title: 'UI/Component',
  component: Component,
  args: {
    // Props par défaut
  },
} as Meta;

export const Default: Story = {};
export const Variant: Story = {
  args: {
    variant: 'secondary',
  },
};
```
