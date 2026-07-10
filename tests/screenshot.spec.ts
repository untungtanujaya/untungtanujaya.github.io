import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const targetDir = '/Users/tanujaya/Projects/personal-website-v2/test-results/photos';

const radiologySlugs = [
  'acr-ti-rads',
  'lung-rads',
  'spn-malignancy',
  'mehran-cin',
  'pi-rads',
  'pediatric-egfr',
  'ct-dose'
];

const psychiatrySlugs = [
  'phq-9',
  'gad-7',
  'cage',
  'cows',
  'gcs',
  'mse-builder',
  'aims'
];

test.describe('Take screenshots of all clinical app calculators', () => {
  test.beforeAll(() => {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
  });

  for (const slug of radiologySlugs) {
    test(`Radiology Desktop - ${slug}`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`/apps/radiology/${slug}`);
      await page.waitForTimeout(1000); // hydration wait
      await page.screenshot({ path: path.join(targetDir, `radiology-${slug}-desktop.png`), fullPage: true });
    });

    test(`Radiology Mobile - ${slug}`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/apps/radiology/${slug}`);
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(targetDir, `radiology-${slug}-mobile.png`), fullPage: true });
    });
  }

  for (const slug of psychiatrySlugs) {
    test(`Psychiatry Desktop - ${slug}`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`/apps/psychiatry/${slug}`);
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(targetDir, `psychiatry-${slug}-desktop.png`), fullPage: true });
    });

    test(`Psychiatry Mobile - ${slug}`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/apps/psychiatry/${slug}`);
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(targetDir, `psychiatry-${slug}-mobile.png`), fullPage: true });
    });
  }
});
