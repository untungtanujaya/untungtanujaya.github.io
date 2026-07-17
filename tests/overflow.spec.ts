import { test, expect } from '@playwright/test';

const urls = [
  '/',
  '/resume',
  '/projects',
  '/projects/custom-ocr-service-rpa-engine-8',
  '/articles',
  '/articles/idempotent-reprocessing-scoped-deletes',
  '/apps',
  '/apps/psychiatry/phq-9',
  '/apps/radiology/acr-ti-rads'
];

const widths = [320, 360, 375, 414];

test.describe('Mobile Horizontal Overflow Audit', () => {
  for (const width of widths) {
    test.describe(`Width ${width}px`, () => {
      test.use({ viewport: { width, height: 667 } });

      for (const url of urls) {
        test(`Page "${url}" should not overflow horizontally at ${width}px`, async ({ page }) => {
      await page.goto(url);
      await page.waitForTimeout(500); // Allow any layout/rendering to settle

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

      if (scrollWidth > clientWidth) {
        // Find offending elements
        const offenders = await page.evaluate((width) => {
          const els = [];
          document.querySelectorAll('*').forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.width > width) {
              // Check if inside pre or has overflow-x auto
              let isScrollable = false;
              let curr = el as HTMLElement | null;
              while (curr && curr !== document.documentElement) {
                if (curr.tagName === 'PRE') {
                  isScrollable = true;
                  break;
                }
                const style = window.getComputedStyle(curr);
                if (style.overflowX === 'auto' || style.overflowX === 'scroll') {
                  isScrollable = true;
                  break;
                }
                curr = curr.parentElement;
              }
              if (!isScrollable && el !== document.documentElement && el !== document.body) {
                els.push({
                  tag: el.tagName,
                  class: el.className,
                  id: el.id,
                  width: rect.width,
                  html: el.outerHTML.substring(0, 150)
                });
              }
            }
          });
          return els;
        }, clientWidth);

        console.log(`Offenders on ${url}:`, offenders);
        expect(offenders).toHaveLength(0);
      }

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
        });
      }
    });
  }
});
