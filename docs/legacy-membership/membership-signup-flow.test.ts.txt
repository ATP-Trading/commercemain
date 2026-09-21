import { test, expect } from '@playwright/test';

test.describe('ATP Membership Signup Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Shopify API responses
    await page.route('**/api/shopify/**', async (route) => {
      const url = route.request().url();
      
      if (url.includes('/customers')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            customer: {
              id: 'gid://shopify/Customer/123456789',
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User'
            }
          })
        });
      } else if (url.includes('/checkout')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            checkoutCreate: {
              checkout: {
                id: 'gid://shopify/Checkout/test-checkout-id',
                webUrl: 'https://test-store.myshopify.com/checkout/test-checkout-id'
              }
            }
          })
        });
      }
    });
  });

  test('should complete membership signup flow successfully', async ({ page }) => {
    // Navigate to membership page
    await page.goto('/en/atp-membership');
    
    // Verify membership benefits are displayed
    await expect(page.locator('[data-testid="membership-benefits"]')).toBeVisible();
    await expect(page.locator('text=99 AED')).toBeVisible();
    await expect(page.locator('text=15% discount')).toBeVisible();
    await expect(page.locator('text=Free delivery')).toBeVisible();
    
    // Click signup button
    await page.click('[data-testid="membership-signup-button"]');
    
    // Verify signup form is displayed
    await expect(page.locator('[data-testid="membership-signup-form"]')).toBeVisible();
    
    // Fill in customer information (if not logged in)
    if (await page.locator('[data-testid="customer-email"]').isVisible()) {
      await page.fill('[data-testid="customer-email"]', 'test@example.com');
      await page.fill('[data-testid="customer-first-name"]', 'Test');
      await page.fill('[data-testid="customer-last-name"]', 'User');
    }
    
    // Proceed to payment
    await page.click('[data-testid="proceed-to-payment"]');
    
    // Verify redirect to Shopify checkout
    await expect(page).toHaveURL(/.*checkout.*/);
    
    // Verify membership data is stored (mock API call)
    const membershipData = await page.evaluate(() => {
      return localStorage.getItem('atp-membership-pending');
    });
    expect(membershipData).toBeTruthy();
  });

  test('should handle signup errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/shopify/customers', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    await page.goto('/en/atp-membership');
    await page.click('[data-testid="membership-signup-button"]');
    
    // Fill form and submit
    await page.fill('[data-testid="customer-email"]', 'test@example.com');
    await page.click('[data-testid="proceed-to-payment"]');
    
    // Verify error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=Something went wrong')).toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    await page.goto('/en/atp-membership');
    await page.click('[data-testid="membership-signup-button"]');
    
    // Try to submit without required fields
    await page.click('[data-testid="proceed-to-payment"]');
    
    // Verify validation errors
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    
    // Fill invalid email
    await page.fill('[data-testid="customer-email"]', 'invalid-email');
    await page.click('[data-testid="proceed-to-payment"]');
    
    // Verify email validation error
    await expect(page.locator('text=Please enter a valid email')).toBeVisible();
  });

  test('should support Arabic language', async ({ page }) => {
    await page.goto('/ar/atp-membership');
    
    // Verify Arabic content is displayed
    await expect(page.locator('text=عضوية مجموعة ATP')).toBeVisible();
    await expect(page.locator('text=99 درهم')).toBeVisible();
    await expect(page.locator('text=خصم 15%')).toBeVisible();
    
    // Verify RTL layout
    const body = page.locator('body');
    await expect(body).toHaveAttribute('dir', 'rtl');
  });

  test('should handle membership renewal flow', async ({ page }) => {
    // Mock existing membership
    await page.addInitScript(() => {
      localStorage.setItem('atp-membership', JSON.stringify({
        id: 'mem_123',
        status: 'active',
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        customerId: 'cust_123'
      }));
    });
    
    await page.goto('/en/account/membership');
    
    // Verify renewal reminder is displayed
    await expect(page.locator('[data-testid="renewal-reminder"]')).toBeVisible();
    
    // Click renew button
    await page.click('[data-testid="renew-membership"]');
    
    // Verify renewal flow
    await expect(page.locator('[data-testid="renewal-confirmation"]')).toBeVisible();
  });
});