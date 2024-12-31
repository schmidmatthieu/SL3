# Guide d'ajout de traductions aux composants React

Ce guide explique la procédure optimale pour ajouter des traductions à vos composants React dans notre application Next.js.

## Procédure étape par étape

### 1. Recherche des traductions existantes

Cette étape est CRUCIALE et doit être effectuée en PREMIER :

1. Examiner le fichier `/app/i18n/locales/en/translation.json` pour trouver les traductions existantes
2. Chercher des clés similaires ou correspondantes à votre besoin
3. Noter que les noms peuvent varier légèrement, soyez attentif aux patterns :
   ```javascript
   // Exemple de variations possibles pour un titre de section :
   "mySection.title"
   "mySection.title.main"
   "mySection.titleHighlight"
   ```

4. Conseils pour la recherche :
   - Chercher par contexte (ex: 'features', 'cta', 'hero')
   - Chercher par type (ex: 'title', 'description', 'button')
   - Explorer les sections connexes qui pourraient contenir des traductions réutilisables

### 2. Préparation du composant

1. Convertir le composant en Client Component :
```typescript
'use client';
import { useTranslation } from 'react-i18next';
```

2. Ajouter la gestion du rendu côté client :
```typescript
export function MyComponent() {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <StaticContent />;  // Version statique
  }

  return <TranslatedContent />;  // Version traduite
}
```

### 3. Utilisation des traductions existantes

❌ À éviter :
```typescript
// Ne PAS créer de nouvelles clés si des traductions similaires existent
t('monComposant.nouveauTitre')  // Mauvais
t('features.items.title')       // Mauvais - Vérifier d'abord si 'features.list.title' existe
```

✅ Bonnes pratiques :
```typescript
// Utiliser les clés existantes
t('features.title')             // Bon - Utilise une clé existante
t('features.list.eventPlanning.title')  // Bon - Suit la structure existante
```

### 4. Exemple concret

Prenons l'exemple d'une section Features :

1. D'abord, examiner le fichier de traduction :
```json
{
  "features": {
    "title": "Powered by",
    "titleHighlight": "Innovation",
    "subtitle": "Experience the next generation...",
    "list": {
      "eventPlanning": {
        "title": "Event Planning",
        "description": "Comprehensive tools..."
      }
    }
  }
}
```

2. Implémenter le composant en utilisant ces clés :
```typescript
'use client';

export function FeaturesSection() {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  // ... gestion du rendu client

  return (
    <div>
      <h2>
        {t('features.title')}{' '}
        <span>{t('features.titleHighlight')}</span>
      </h2>
      <p>{t('features.subtitle')}</p>
      
      {features.map(feature => (
        <div key={feature.key}>
          <h3>{t(`features.list.${feature.key}.title`)}</h3>
          <p>{t(`features.list.${feature.key}.description`)}</p>
        </div>
      ))}
    </div>
  );
}
```

### 5. Vérification

Avant de finaliser :
- [x] Toutes les clés utilisées existent dans le fichier de traduction
- [x] Aucune nouvelle clé n'a été créée sans nécessité
- [x] La structure des clés correspond à celle existante
- [x] Le composant a la directive `'use client'`
- [x] La gestion du rendu initial est en place

## Ajout de nouvelles traductions

### 1. Quand ajouter de nouvelles traductions

Ajouter de nouvelles traductions UNIQUEMENT lorsque :
- Vous avez vérifié qu'aucune traduction existante ne correspond à votre besoin
- Vous avez exploré toutes les variations possibles de noms de clés
- Vous avez consulté les sections connexes du fichier de traduction

### 2. Structure des nouvelles traductions

1. **Hiérarchie des clés** :
   ```json
   {
     "componentName": {
       "section": {
         "element": "value",
         "subElement": {
           "title": "value",
           "description": "value"
         }
       }
     }
   }
   ```

2. **Conventions de nommage** :
   - Utiliser le camelCase
   - Noms descriptifs et courts
   - Structure cohérente avec l'existant
   - Éviter les noms trop génériques

### 3. Processus d'ajout multilingue

CRUCIAL : Toute nouvelle traduction doit être ajoutée dans TOUTES les langues supportées :
- 🇬🇧 `/app/i18n/locales/en/translation.json`
- 🇫🇷 `/app/i18n/locales/fr/translation.json`
- 🇩🇪 `/app/i18n/locales/de/translation.json`
- 🇮🇹 `/app/i18n/locales/it/translation.json`

Exemple d'ajout dans toutes les langues :

1. **English (en)** :
```json
{
  "newSection": {
    "title": "Welcome to our platform",
    "description": "Discover amazing features"
  }
}
```

2. **Français (fr)** :
```json
{
  "newSection": {
    "title": "Bienvenue sur notre plateforme",
    "description": "Découvrez des fonctionnalités incroyables"
  }
}
```

3. **Deutsch (de)** :
```json
{
  "newSection": {
    "title": "Willkommen auf unserer Plattform",
    "description": "Entdecken Sie erstaunliche Funktionen"
  }
}
```

4. **Italiano (it)** :
```json
{
  "newSection": {
    "title": "Benvenuto sulla nostra piattaforma",
    "description": "Scopri funzionalità straordinarie"
  }
}
```

### 4. Bonnes pratiques pour les nouvelles traductions

1. **Documentation** :
   - Commenter les nouvelles clés si leur usage n'est pas évident
   - Documenter les variables dynamiques utilisées

2. **Organisation** :
   - Grouper les traductions logiquement
   - Maintenir une structure cohérente entre les langues
   - Éviter la duplication de clés

3. **Maintenance** :
   ```json
   {
     "myComponent": {
       "// Ce groupe concerne la section principale": "",
       "mainSection": {
         "title": "Titre",
         "// Les variables disponibles sont: {name}, {count}": "",
         "description": "Description avec {name} et {count} éléments"
       }
     }
   }
   ```

### 5. Vérification des nouvelles traductions

Checklist avant de commiter :
- [ ] Traductions ajoutées dans TOUTES les langues (en, fr, de, it)
- [ ] Structure cohérente dans tous les fichiers
- [ ] Noms de clés suivent les conventions
- [ ] Variables dynamiques documentées
- [ ] Pas de clés en double
- [ ] Traductions vérifiées par un locuteur natif si possible

### 6. Tests et validation

1. **Tests manuels** :
   - Changer la langue de l'application
   - Vérifier l'affichage dans chaque langue
   - Tester les cas avec variables

2. **Tests automatisés** :
   - Ajouter des tests pour les nouvelles clés
   - Vérifier la présence des clés dans toutes les langues

## Résolution des problèmes courants

1. **Clé introuvable** :
   - Vérifier les variations possibles de la clé
   - Explorer les sections connexes du fichier de traduction
   - Réutiliser une clé existante si le contexte est similaire

2. **Structure différente** :
   - Adapter votre composant à la structure existante
   - Ne pas modifier la structure des traductions existantes

3. **Incohérence de nommage** :
   - Suivre le pattern de nommage existant
   - Adapter votre code plutôt que de créer de nouvelles clés

## Ressources

- Documentation i18next : [https://www.i18next.com/](https://www.i18next.com/)
- Fichiers de traduction du projet : `/app/i18n/locales/`
