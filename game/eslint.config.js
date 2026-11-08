import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'playwright-report/**', 'test-results/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ['src/**/*.tsx'],
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['src/domain/**/*.ts', 'src/engine/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['react', 'react/*', 'zustand', 'zustand/*', 'dexie', '**/content/**', '**/application/**', '**/infrastructure/**', '**/features/**', '**/app/**'],
          message: 'Domain và engine phải độc lập với giao diện, state store và hạ tầng.',
        }],
      }],
    },
  },
  {
    files: ['src/application/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['react', 'react/*', 'dexie', '**/infrastructure/**', '**/features/**', '**/app/**'],
          message: 'Application dùng port; adapter hạ tầng được ghép tại app/bootstrap.ts.',
        }],
      }],
    },
  },
);
