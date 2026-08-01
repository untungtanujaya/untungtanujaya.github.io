import { test, expect } from '@playwright/test';

// Regression tests for the ClientRouter script-lifecycle bug:
// is:inline scripts run only once, so per-element listeners died after a
// body swap. The fix uses document-level event delegation — these tests
// exercise UI behavior across client-side navigations on mobile viewport.
// (Per-page project/article search was removed in favor of Global Search —
// see tests/search.spec.ts and docs/adr/0002.)

test.describe('Navigation lifecycle (ClientRouter)', () => {
  test.use({ viewport: { width: 390, height: 700 } });

  test('burger menu works on initial load and after client-side navigation', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('#menu-toggle');
    const menu = page.locator('#site-menu');

    // Initial page: open + close
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(menu).toHaveClass(/active/);

    // Navigate via the menu link (client-side swap)
    await page.locator('#site-menu a[href="/projects/"]').click();
    await expect(page).toHaveURL(/\/projects\//);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false'); // closed after nav

    // Burger must work again on the new page
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(menu).toHaveClass(/active/);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('burger menu works after back/forward navigation', async ({ page }) => {
    await page.goto('/');
    await page.locator('#menu-toggle').click();
    await page.locator('#site-menu a[href="/articles/"]').click();
    await expect(page).toHaveURL(/\/articles\//);

    await page.goBack();
    await expect(page).toHaveURL((url) => url.pathname === '/');

    const toggle = page.locator('#menu-toggle');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });
});
