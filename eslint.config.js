import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**'],
    files: ['**/*.js'],
    plugins: {
      import: importPlugin,
    },
    rules: {
      'no-unused-vars': 'error',

      // Modern JavaScript
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',

      // Import order based on CODING_STANDARDS.md
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // Node.js built-in modules
            'external', // External libraries
            'internal', // Internal components (absolute imports)
            ['parent', 'sibling'], // Utility functions (relative imports)
            'index',
            'object',
            'type',
          ],
          pathGroups: [
            {
              pattern: './constants/**',
              group: 'sibling',
              position: 'after',
            },
            {
              pattern: '**/*.css',
              group: 'object',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
  pluginJs.configs.recommended,
  eslintPluginPrettier,
  eslintConfigPrettier,
];
