import { test, expect } from '@playwright/test';

// Regression tests for the ClientRouter script-lifecycle bug:
// is:inline scripts run only once, so per-element listeners died after a
// body swap. The fix uses document-level event delegation — these tests
// exercise UI behavior across client-side navigations on mobile viewport.

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
    await expect(page).toHaveURL(/localhost:4321\/?$/);

    const toggle = page.locator('#menu-toggle');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  test('project search works on direct load and after client-side re-visit', async ({ page }) => {
    const expectSearchFilters = async () => {
      await page.fill('#project-search', 'zzzznotfound');
      await expect(page.locator('#empty-state')).toBeVisible();
      await expect(page.locator('.project-card').first()).toBeHidden();
      await page.fill('#project-search', '');
      await expect(page.locator('.project-card').first()).toBeVisible();
    };

    // Direct load
    await page.goto('/projects/');
    await expectSearchFilters();

    // Client-side nav away and back again (this re-visits projects after the
    // router already ran its inline script once — the original failure mode)
    await page.locator('#menu-toggle').click();
    await page.locator('#site-menu a[href="/articles/"]').click();
    await expect(page).toHaveURL(/\/articles\//);
    await page.goBack();
    await expect(page).toHaveURL(/\/projects\//);
    await expectSearchFilters();
  });

  test('article search works after client-side navigation', async ({ page }) => {
    await page.goto('/');
    await page.locator('#menu-toggle').click();
    await page.locator('#site-menu a[href="/articles/"]').click();
    await expect(page).toHaveURL(/\/articles\//);

    await page.fill('#article-search', 'zzzznotfound');
    await expect(page.locator('#empty-state')).toBeVisible();
    await expect(page.locator('.article-card').first()).toBeHidden();
    await page.fill('#article-search', '');
    await expect(page.locator('.article-card').first()).toBeVisible();
  });
});
