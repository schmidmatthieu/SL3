import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';

export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
  },
  eslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        project: ['./tsconfig.json', './apps/api/tsconfig.json'],
        ecmaVersion: 2024,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11y,
      'import': importPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // Règles de taille
      'max-lines': ['error', {
        max: 300,
        skipBlankLines: true,
        skipComments: true,
      }],
      'max-lines-per-function': ['error', {
        max: 100,
        skipBlankLines: true,
        skipComments: true,
      }],

      // Règles TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': ['error', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      }],
      '@typescript-eslint/explicit-member-accessibility': ['error', {
        accessibility: 'explicit',
      }],
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
      }],
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/no-floating-promises': 'error',

      // Règles React
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Règles d'accessibilité
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',

      // Règles d'import
      'import/order': ['warn', {
        'groups': [
          ['builtin', 'external'],
          'internal',
          ['parent', 'sibling', 'index'],
          'type'
        ],
        'newlines-between': 'never',
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true
        }
      }],

      // Règles générales
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
    },
  },
];
