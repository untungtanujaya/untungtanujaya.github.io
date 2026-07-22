import { test, expect } from '@playwright/test';

test.describe('Motion System', () => {
  test('reduced-motion: off total — no gate class, content fully visible', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // Gate class must NOT be applied when user prefers reduced motion
    await expect(page.locator('html')).not.toHaveClass(/motion-ok/);

    // Content that is normally behind the motion gate must be fully visible
    const heroLede = page.locator('.hero-lede[data-reveal]');
    await expect(heroLede).toBeVisible();
    await expect(heroLede).toHaveCSS('opacity', '1');

    const nowPanel = page.locator('.now-panel[data-reveal]');
    await expect(nowPanel).toBeVisible();
    await expect(nowPanel).toHaveCSS('opacity', '1');
  });

  test('motion enabled: gate applied, hero words staggered, reveals settle visible', async ({ page }) => {
    await page.goto('/');

    // Gate class applied for users without reduced-motion preference
    await expect(page.locator('html')).toHaveClass(/motion-ok/);

    // Hero title is split into animatable word spans
    const words = page.locator('.hero-title .word');
    await expect(words).toHaveCount(3);

    // Word stagger completes: every word settles and is marked done
    for (const word of await words.all()) {
      await expect(word).toHaveAttribute('data-reveal-done', '', { timeout: 3000 });
    }

    // Above-fold shift reveal settles fully visible (LCP guard: opacity 1)
    const heroLede = page.locator('.hero-lede[data-reveal]');
    await expect(heroLede).toHaveAttribute('data-reveal-done', '', { timeout: 3000 });
    await expect(heroLede).toHaveCSS('opacity', '1');

    // Projects list: first card is above fold -> settles visible;
    // every card eventually reveals (IO or immediate)
    await page.goto('/projects/');
    const firstCard = page.locator('.project-card[data-reveal]').first();
    await expect(firstCard).toHaveAttribute('data-reveal-done', '', { timeout: 3000 });
    await expect(firstCard).toHaveCSS('opacity', '1');
  });
});
