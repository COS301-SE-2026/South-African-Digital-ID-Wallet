const { transformIgnorePatterns } = require('jest-expo/jest-preset')

const allowEsmPackages = transformIgnorePatterns.map((pattern) =>
  pattern.replace(
    '(?!(.pnpm|',
    '(?!(.pnpm|@noble|@scure|d3-[^/]+|internmap|topojson-client|'
  )
)

module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/\\.\\./modules/flashid-emergency$':
      '<rootDir>/modules/flashid-emergency/__mocks__/index.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: allowEsmPackages,
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
