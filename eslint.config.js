// eslint-disable-next-line @typescript-eslint/no-require-imports
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    ignores: ['node_modules/**', 'playwright-report/**', 'test-results/**', 'demo-app/**'],
  },
  ...tseslint.configs.recommended,
);
