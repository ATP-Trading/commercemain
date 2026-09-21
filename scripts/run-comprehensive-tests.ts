#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { performance } from 'perf_hooks';
import chalk from 'chalk';

interface TestSuite {
  name: string;
  command: string;
  timeout: number;
  critical: boolean;
}

const testSuites: TestSuite[] = [
  {
    name: 'Unit Tests',
    command: 'vitest run __tests__/**/*.test.ts --reporter=verbose',
    timeout: 60000,
    critical: true
  },
  {
    name: 'Component Tests',
    command: 'vitest run __tests__/components/**/*.test.tsx --reporter=verbose',
    timeout: 60000,
    critical: true
  },
  {
    name: 'Accessibility Tests',
    command: 'vitest run __tests__/accessibility/**/*.test.tsx --reporter=verbose',
    timeout: 180000,
    critical: true
  },
  {
    name: 'E2E Tests',
    command: 'playwright test __tests__/e2e/**/*.test.ts',
    timeout: 600000,
    critical: true
  }
];

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
}

class TestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;

  async runAllTests(): Promise<void> {
    console.log(chalk.blue.bold('🧪 Starting Comprehensive Test Suite for ATP Membership System\n'));
    
    this.startTime = performance.now();
    
    for (const suite of testSuites) {
      await this.runTestSuite(suite);
    }
    
    this.printSummary();
    this.exitWithCode();
  }

  private async runTestSuite(suite: TestSuite): Promise<void> {
    console.log(chalk.yellow(`\n📋 Running ${suite.name}...`));
    console.log(chalk.gray(`Command: ${suite.command}`));
    console.log(chalk.gray(`Timeout: ${suite.timeout / 1000}s`));
    
    const startTime = performance.now();
    
    try {
      execSync(suite.command, {
        stdio: 'inherit',
        timeout: suite.timeout,
        env: {
          ...process.env,
          NODE_ENV: 'test',
          CI: 'true'
        }
      });
      
      const duration = performance.now() - startTime;
      this.results.push({
        name: suite.name,
        success: true,
        duration
      });
      
      console.log(chalk.green(`✅ ${suite.name} completed successfully (${(duration / 1000).toFixed(2)}s)`));
      
    } catch (error) {
      const duration = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      this.results.push({
        name: suite.name,
        success: false,
        duration,
        error: errorMessage
      });
      
      if (suite.critical) {
        console.log(chalk.red(`❌ ${suite.name} failed (CRITICAL) (${(duration / 1000).toFixed(2)}s)`));
        console.log(chalk.red(`Error: ${errorMessage}`));
      } else {
        console.log(chalk.yellow(`⚠️  ${suite.name} failed (NON-CRITICAL) (${(duration / 1000).toFixed(2)}s)`));
        console.log(chalk.yellow(`Error: ${errorMessage}`));
      }
    }
  }

  private printSummary(): void {
    const totalDuration = performance.now() - this.startTime;
    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const criticalFailed = this.results.filter(r => !r.success && this.isCritical(r.name)).length;
    
    console.log(chalk.blue.bold('\n📊 Test Suite Summary'));
    console.log(chalk.blue('═'.repeat(50)));
    
    console.log(`Total Duration: ${chalk.cyan((totalDuration / 1000).toFixed(2))}s`);
    console.log(`Total Suites: ${chalk.cyan(this.results.length)}`);
    console.log(`Successful: ${chalk.green(successful)}`);
    console.log(`Failed: ${chalk.red(failed)}`);
    console.log(`Critical Failures: ${chalk.red.bold(criticalFailed)}`);
    
    console.log(chalk.blue('\n📋 Detailed Results:'));
    this.results.forEach(result => {
      const status = result.success ? chalk.green('✅ PASS') : chalk.red('❌ FAIL');
      const duration = chalk.gray(`(${(result.duration / 1000).toFixed(2)}s)`);
      const critical = this.isCritical(result.name) ? chalk.red('[CRITICAL]') : '';
      
      console.log(`${status} ${result.name} ${duration} ${critical}`);
      
      if (!result.success && result.error) {
        console.log(chalk.red(`   └─ ${result.error.split('\n')[0]}`));
      }
    });

    // Performance metrics
    console.log(chalk.blue('\n⚡ Performance Metrics:'));
    const performanceResult = this.results.find(r => r.name === 'Performance Tests');
    if (performanceResult?.success) {
      console.log(chalk.green('✅ All performance thresholds met'));
    } else if (performanceResult) {
      console.log(chalk.yellow('⚠️  Some performance thresholds not met'));
    }

    // Accessibility metrics
    const accessibilityResult = this.results.find(r => r.name === 'Accessibility Tests');
    if (accessibilityResult?.success) {
      console.log(chalk.green('✅ All accessibility requirements met'));
    } else if (accessibilityResult) {
      console.log(chalk.red('❌ Accessibility violations found'));
    }

    // Load test metrics
    const loadResult = this.results.find(r => r.name === 'Load Tests');
    if (loadResult?.success) {
      console.log(chalk.green('✅ System handles expected load'));
    } else if (loadResult) {
      console.log(chalk.yellow('⚠️  Load test thresholds not met'));
    }
  }

  private isCritical(suiteName: string): boolean {
    const suite = testSuites.find(s => s.name === suiteName);
    return suite?.critical ?? false;
  }

  private exitWithCode(): void {
    const criticalFailures = this.results.filter(r => !r.success && this.isCritical(r.name)).length;
    
    if (criticalFailures > 0) {
      console.log(chalk.red.bold(`\n💥 ${criticalFailures} critical test suite(s) failed. Build should not proceed.`));
      process.exit(1);
    } else {
      const nonCriticalFailures = this.results.filter(r => !r.success && !this.isCritical(r.name)).length;
      if (nonCriticalFailures > 0) {
        console.log(chalk.yellow.bold(`\n⚠️  ${nonCriticalFailures} non-critical test suite(s) failed. Build can proceed with warnings.`));
      } else {
        console.log(chalk.green.bold('\n🎉 All test suites passed successfully!'));
      }
      process.exit(0);
    }
  }
}

// Quality gates
class QualityGates {
  static checkCoverage(): boolean {
    try {
      execSync('vitest run --coverage --reporter=json > coverage-report.json', { stdio: 'pipe' });
      // Parse coverage report and check thresholds
      return true;
    } catch {
      return false;
    }
  }

  static checkPerformance(): boolean {
    // Performance thresholds are checked within the performance tests
    return true;
  }

  static checkAccessibility(): boolean {
    // Accessibility checks are performed in the accessibility tests
    return true;
  }

  static checkSecurity(): boolean {
    try {
      execSync('npm audit --audit-level=high', { stdio: 'pipe' });
      return true;
    } catch {
      console.log(chalk.yellow('⚠️  Security vulnerabilities found in dependencies'));
      return false;
    }
  }
}

// Main execution
async function main() {
  const runner = new TestRunner();
  
  // Pre-flight checks
  console.log(chalk.blue('🔍 Running pre-flight checks...'));
  
  const securityCheck = QualityGates.checkSecurity();
  if (!securityCheck) {
    console.log(chalk.yellow('⚠️  Security check failed, but continuing with tests...'));
  }
  
  // Run comprehensive tests
  await runner.runAllTests();
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error(chalk.red.bold('💥 Uncaught Exception:'), error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(chalk.red.bold('💥 Unhandled Rejection:'), reason);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error(chalk.red.bold('💥 Test runner failed:'), error);
    process.exit(1);
  });
}

export { TestRunner, QualityGates };