import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export const testConfig = defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      '__tests__/**/*.test.{ts,tsx}',
      '__tests__/e2e/**/*.test.{ts,tsx}',
      '__tests__/performance/**/*.test.{ts,tsx}',
      '__tests__/accessibility/**/*.test.{ts,tsx}',
      '__tests__/load/**/*.test.{ts,tsx}'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        '**/*.d.ts',
        '**/*.config.{ts,js}',
        '**/coverage/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    testTimeout: 30000, // 30 seconds for load tests
    hookTimeout: 10000,
    teardownTimeout: 5000
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../'),
      '@/components': resolve(__dirname, '../../components'),
      '@/lib': resolve(__dirname, '../../lib'),
      '@/hooks': resolve(__dirname, '../../hooks'),
      '@/__tests__': resolve(__dirname, '../')
    }
  }
});

// Performance test configuration
export const performanceTestConfig = {
  thresholds: {
    discountCalculation: {
      maxTime: 0.01, // 0.01ms per calculation
      minOperationsPerSecond: 100000
    },
    membershipValidation: {
      maxTime: 0.01, // 0.01ms per validation
      minOperationsPerSecond: 100000
    },
    bulkOperations: {
      maxTime: 10, // 10ms for 100 items
      minOperationsPerSecond: 10000
    }
  },
  memoryLimits: {
    maxMemoryIncrease: 10 * 1024 * 1024, // 10MB
    maxMemoryIncreasePercent: 50 // 50%
  }
};

// Load test configuration
export const loadTestConfig = {
  concurrency: {
    membershipCreation: 100,
    membershipLookup: 1000,
    discountCalculation: 100000
  },
  thresholds: {
    requestsPerSecond: {
      membershipCreation: 50,
      membershipLookup: 200,
      discountCalculation: 100000
    },
    successRate: {
      minimum: 0.95, // 95% success rate
      withErrors: 0.8 // 80% with simulated errors
    },
    responseTime: {
      maximum: 5000, // 5 seconds
      average: 100 // 100ms average
    }
  }
};

// Accessibility test configuration
export const accessibilityTestConfig = {
  axeConfig: {
    rules: {
      'color-contrast': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'focus-management': { enabled: true },
      'aria-labels': { enabled: true },
      'semantic-markup': { enabled: true }
    },
    tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
  },
  testCases: {
    components: [
      'MembershipBadge',
      'MemberPricing'
    ],
    scenarios: [
      'active-membership',
      'expired-membership',
      'no-membership',
      'loading-state',
      'error-state'
    ],
    locales: ['en', 'ar']
  }
};

// E2E test configuration
export const e2eTestConfig = {
  baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
  timeout: 30000,
  retries: 2,
  browsers: ['chromium', 'firefox', 'webkit'],
  devices: ['Desktop Chrome', 'iPhone 12', 'iPad'],
  scenarios: [
    'membership-signup-flow',
    'membership-renewal-flow',
    'discount-application',
    'error-handling',
    'accessibility-compliance'
  ]
};

export default testConfig;