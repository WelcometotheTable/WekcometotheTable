import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Flat config. Quality gate: no `any`, no console, no unused.
export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: { project: ['./tsconfig.app.json', './tsconfig.node.json'] },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
);
