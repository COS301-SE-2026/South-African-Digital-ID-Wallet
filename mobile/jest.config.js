const { transformIgnorePatterns } = require('jest-expo/jest-preset')

// @noble and @scure v2 ship ESM only, so Jest has to transform them rather than skip them. The
// preset allows .pnpm through, but pnpm nests packages under a second node_modules, where the
// pattern matches again and ignores them. Adding both scopes to the allowlist covers that path.
const allowEsmCryptoPackages = transformIgnorePatterns.map((pattern) =>
  pattern.replace('(?!(.pnpm|', '(?!(.pnpm|@noble|@scure|')
)

module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: allowEsmCryptoPackages,
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/index.ts',
    '!src/**/types.ts',
    '!src/test/**',
  ],
  coverageReporters: ['text', 'lcov'],
}
