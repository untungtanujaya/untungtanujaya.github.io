import { test, expect } from '@playwright/test';

// Global Search (/search/) — see docs/adr/0002.
// Covers: navbar entry points (desktop field / mobile icon), live filtering,
// relevance, pagination with URL sync, deep links, ClientRouter lifecycle,
// no-JS degradation, and the hero-spacing regression fix.

test.describe('Global Search — navbar entry points', () => {
  test('desktop: nav search field submits to /search/?q=', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const navInput = page.locator('.nav-search-input');
    await expect(navInput).toBeVisible();

    await navInput.fill('redis');
    await navInput.press('Enter');

    await expect(page).toHaveURL(/\/search\/\?q=redis/);
    await expect(page.locator('#search-count')).toContainText('result');
    await expect(page.locator('.search-result').first()).toBeVisible();
    await expect(page.locator('.search-result', { hasText: /redis/i }).first()).toBeVisible();
  });

  test('mobile: icon-only search link, field hidden, burger intact', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 700 });
    await page.goto('/');

    // NN/g: icon-only search is acceptable on mobile; desktop keeps the field
    await expect(page.locator('.nav-search-link')).toBeVisible();
    await expect(page.locator('.nav-search-input')).toBeHidden();
    await expect(page.locator('#menu-toggle')).toBeVisible();

    await page.locator('.nav-search-link').click();
    await expect(page).toHaveURL(/\/search\//);
    await expect(page.locator('#search-page-input')).toBeVisible();

    // Burger still works alongside the new search icon
    await page.locator('#menu-toggle').click();
    await expect(page.locator('#menu-toggle')).toHaveAttribute('aria-expanded', 'true');
  });
});

test.describe('Global Search — behavior', () => {
  test('browse mode shows first 10 items and paginates via URL', async ({ page }) => {
    await page.goto('/search/');

    await expect(page.locator('#search-count')).toHaveText(/Browse all \d+ items/);
    await expect(page.locator('.search-result')).toHaveCount(10);

    const firstTitlePage1 = await page.locator('.search-result-title').first().textContent();

    // Pagination rendered by JS with real links
    const page2 = page.locator('#search-pagination a', { hasText: '2' });
    await expect(page2).toBeVisible();
    await page2.click();

    await expect(page).toHaveURL(/\/search\/\?page=2/);
    await expect(page.locator('#search-pagination [aria-current="page"]')).toHaveText('2');
    const firstTitlePage2 = await page.locator('.search-result-title').first().textContent();
    expect(firstTitlePage2).not.toEqual(firstTitlePage1);
  });

  test('deep link ?q= pre-fills input and filters results', async ({ page }) => {
    // NB: "phq" alone also matches "GraPHQl" — use the full token.
    await page.goto('/search/?q=phq-9');

    await expect(page.locator('#search-page-input')).toHaveValue('phq-9');
    await expect(page.locator('#search-count')).toHaveText('1 result for "phq-9"');
    await expect(page.locator('.search-result')).toHaveCount(1);
    await expect(page.locator('.search-result-title')).toContainText('PHQ-9');
    // Relevance badge communicates scope/type
    await expect(page.locator('.search-result-type')).toHaveText('Clinical App');
  });

  test('no results shows empty state with recovery link', async ({ page }) => {
    await page.goto('/search/?q=zzzznotfound');

    await expect(page.locator('#search-count')).toHaveText('0 results for "zzzznotfound"');
    await expect(page.locator('.search-result')).toHaveCount(0);
    await expect(page.locator('#search-empty')).toBeVisible();
    await expect(page.locator('#search-empty a[href="/search/"]')).toBeVisible();
  });

  test('live filter survives client-side navigation away and back', async ({ page }) => {
    await page.goto('/search/');

    // Live filter: URL syncs via replaceState, count updates without reload
    await page.fill('#search-page-input', 'redis');
    await expect(page).toHaveURL(/\/search\/\?q=redis/);
    await expect(page.locator('#search-count')).toContainText('result');
    const resultCount = await page.locator('.search-result').count();
    expect(resultCount).toBeGreaterThan(0);

    // Client-side nav away (desktop nav link), then back — listener must
    // still work (delegation idempotency, ADR-0001 regression class)
    await page.locator('#site-menu a[href="/articles/"]').click();
    await expect(page).toHaveURL(/\/articles\//);
    await page.goBack();
    await expect(page).toHaveURL(/\/search\/\?q=redis/);
    await expect(page.locator('#search-page-input')).toHaveValue('redis');
    await expect(page.locator('.search-result')).toHaveCount(resultCount);

    // Clearing restores browse mode and still responds after the swap
    await page.fill('#search-page-input', '');
    await expect(page.locator('#search-count')).toHaveText(/Browse all \d+ items/);
    await expect(page.locator('.search-result')).toHaveCount(10);
  });

  test('multi-token queries use AND semantics', async ({ page }) => {
    await page.goto('/search/?q=go+concurrency');

    // Both tokens must match somewhere; "go" alone would match far more
    const count = await page.locator('.search-result').count();
    expect(count).toBeGreaterThan(0);
    await expect(page.locator('.search-result', { hasText: /concurrenc/i }).first()).toBeVisible();
  });
});

test.describe('Global Search — no-JS degradation', () => {
  test.use({ javaScriptEnabled: false });

  test('server renders first page results without JavaScript', async ({ page }) => {
    await page.goto('/search/');

    // Static shell: 10 server-rendered results, honest count, no broken
    // pagination links (JS-only by design on static hosting)
    await expect(page.locator('.search-result')).toHaveCount(10);
    await expect(page.locator('#search-count')).toHaveText(/Browse all \d+ items/);
    await expect(page.locator('#search-pagination a')).toHaveCount(0);
  });
});

test.describe('Hero spacing regression (page-hero / resume-hero)', () => {
  const cases = [
    { url: '/resume/', subtitle: '.resume-summary' },
    { url: '/projects/', subtitle: '.page-copy' },
    { url: '/articles/', subtitle: '.page-copy' },
    { url: '/search/', subtitle: '.page-copy' },
  ];

  for (const width of [1280, 390]) {
    for (const { url, subtitle } of cases) {
      test(`${url} has breathing room between title and subtitle at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(url);

        const gaps = await page.evaluate((subtitleSel) => {
          const title = document.querySelector('.page-title');
          const sub = document.querySelector(subtitleSel);
          const eyebrow = document.querySelector('.page-hero .eyebrow, .resume-hero .eyebrow');
          if (!title || !sub || !eyebrow) return null;
          const t = title.getBoundingClientRect();
          const s = sub.getBoundingClientRect();
          const e = eyebrow.getBoundingClientRect();
          return { eyebrowToTitle: t.top - e.bottom, titleToSubtitle: s.top - t.bottom };
        }, subtitle);

        expect(gaps).not.toBeNull();
        expect(gaps!.titleToSubtitle).toBeGreaterThanOrEqual(8);
        expect(gaps!.eyebrowToTitle).toBeGreaterThanOrEqual(8);
      });
    }
  }
});
