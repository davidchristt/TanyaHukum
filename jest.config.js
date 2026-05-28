const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'node',
  testEnvironmentOptions: {
    // Ensure packages with conditional exports (e.g. jose) resolve to Node builds.
    customExportConditions: ['node', 'node-addons'],
  },
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.(js|jsx|ts|tsx)',
    '<rootDir>/tests/integration/**/*.test.(js|jsx|ts|tsx)',
    '<rootDir>/tests/error-handling/**/*.test.(js|jsx|ts|tsx)',
    '<rootDir>/tests/security/**/*.test.(js|jsx|ts|tsx)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    '/node_modules/(?!(jose)/)',
  ],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'json-summary'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/reports',
        outputName: 'jest-junit.xml',
      },
    ],
  ],
};

module.exports = createJestConfig(customJestConfig);

