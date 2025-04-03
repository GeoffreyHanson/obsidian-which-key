import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  // Use ts-jest for TypeScript files
  preset: 'ts-jest',

  // Set test environment (node or jsdom)
  testEnvironment: 'node',

  // Pattern for test files
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],

  // Directories to ignore
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  // Module file extensions
  moduleFileExtensions: ['ts', 'js', 'json'],

  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};

export default config;
