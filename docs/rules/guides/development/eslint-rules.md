# Règles ESLint Personnalisées

## Règle : max-file-lines

Cette règle est configurée pour maintenir la modularité du code en limitant la taille des fichiers.

### Configuration

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'max-lines': [
      'error',
      {
        max: 300,
        skipBlankLines: true,
        skipComments: true,
      },
    ],
    'max-lines-per-function': [
      'error',
      {
        max: 100,
        skipBlankLines: true,
        skipComments: true,
      },
    ],
  },
};
```

### Messages d'Erreur

```
error  File has too many lines (350). Maximum allowed is 300  max-lines
error  Function has too many lines (175). Maximum allowed is 100  max-lines-per-function
```

### Process de Correction

1. **Analyse**

   - Identifier les sections logiques
   - Repérer les responsabilités distinctes
   - Noter les dépendances

2. **Refactoring**

   ```typescript
   // Avant
   export function BigComponent() {
     // 350 lignes de code
   }

   // Après
   export function BigComponent() {
     return (
       <ModuleContainer>
         <ModuleA />
         <ModuleB />
         <ModuleC />
       </ModuleContainer>
     );
   }
   ```

3. **Structure Recommandée**
   ```
   components/[feature]/
   ├── [component]/
   │   ├── index.tsx        # Composant principal
   │   ├── sub-components/  # Sous-composants
   │   │   ├── module-a.tsx
   │   │   ├── module-b.tsx
   │   │   └── module-c.tsx
   │   ├── hooks.ts        # Hooks spécifiques
   │   ├── utils.ts        # Utilitaires
   │   └── types.ts        # Types
   └── ui/                 # Composants UI réutilisables
   ```

### Exceptions

- Fichiers de configuration
- Fichiers de constantes
- Fichiers de types
- Tests E2E

### Bonnes Pratiques

1. **Prévention**

   - Planifier la modularisation dès le début
   - Créer des composants atomiques
   - Utiliser des hooks personnalisés
   - Séparer la logique métier

2. **Maintenance**

   - Review de code régulière
   - Refactoring proactif
   - Documentation des décisions
   - Tests automatisés

3. **Documentation**
   ```typescript
   /**
    * @module EventSettings
    * @description Gestion des paramètres d'événement
    * @modularization
    * - Formulaire → event-form.tsx
    * - Métadonnées → event-metadata.tsx
    * - Planification → event-scheduling.tsx
    * - Médias → event-media.tsx
    */
   ```
