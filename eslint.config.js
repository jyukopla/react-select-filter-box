// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'storybook-static', '.storybook']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Allow setState in effects for intentional patterns
      // Many components legitimately sync state based on props
      'react-hooks/exhaustive-deps': 'warn',
      // Disable React Compiler rules that are too strict
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/set-state-in-effect': 'off',
      // Allow multiple exports for utility files
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Allow unused vars with underscore prefix
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
    },
  },
  ...storybook.configs["flat/recommended"],
  {
    files: ['**/*.stories.tsx', '**/*.stories.ts'],
    rules: {
      // Allow @storybook/react imports for type definitions
      'storybook/no-renderer-packages': 'off',
    },
  },
])
