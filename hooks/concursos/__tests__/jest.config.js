// Configuração Jest específica para testes dos hooks de concursos
module.exports = {
  displayName: 'Concursos Hooks Tests',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/hooks/concursos/__tests__/setup.ts'],
  testMatch: [
    '<rootDir>/hooks/concursos/__tests__/**/*.test.{ts,tsx}',
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'hooks/concursos/**/*.{ts,tsx}',
    '!hooks/concursos/**/*.test.{ts,tsx}',
    '!hooks/concursos/__tests__/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: '<rootDir>/coverage/hooks-concursos',
  testTimeout: 10000,
  verbose: true,
};