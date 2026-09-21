import { test, expect } from '@playwright/test';
import en from '../../messages/en.json';
import ar from '../../messages/ar.json';

// This is deliberately SSR-only smoke coverage, not hydration or a transaction.
// Disabling JavaScript avoids automatic cart initialization and any client writes.
test.use({ javaScriptEnabled: false });

for (const locale of ['en', 'ar'] as const) {
  const messages = locale === 'ar' ? ar : en;
  test.describe(`${locale} current guest server-rendered routes`, () => {
    test.beforeEach(async ({ context }) => {
      await context.route('**/*', async route => {
        const method = route.request().method();
        if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
          await route.abort('blockedbyclient');
          throw new Error(`Unexpected mutation blocked in SSR-only smoke: ${method}`);
        }
        await route.continue();
      });
    });
    test('login serves the localized OAuth page shell without a password form', async ({ page }) => {
      const response = await page.goto(`/${locale}/login`);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(`${messages.auth.signIn} - ATP Trading`);
      await expect(page.getByRole('link', { name: messages.auth.exploreMembershipBenefits, exact: true })).toBeVisible();
      await expect(page.locator('input[type="password"]')).toHaveCount(0);
      await expect(page.locator(`[dir="${locale === 'ar' ? 'rtl' : 'ltr'}"]`).first()).toBeAttached();
    });
    test('signup shows the current OAuth account entry', async ({ page }) => {
      const response = await page.goto(`/${locale}/signup`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('[data-slot="card-title"]', { hasText: messages.auth.createAccount })).toBeVisible();
      await expect(page.locator('input[type="password"]')).toHaveCount(0);
    });
    test('membership alias reaches the current product, not the retired signup form', async ({ page }) => {
      await page.goto(`/${locale}/atp-membership`);
      await expect(page).toHaveURL(new RegExp(`/${locale}/product/atp-membership(?:[/?#]|$)`));
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('[data-testid="membership-signup-form"]')).toHaveCount(0);
    });
  });
}
