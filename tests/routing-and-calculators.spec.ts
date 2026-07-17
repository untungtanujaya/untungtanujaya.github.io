import { test, expect } from '@playwright/test';

test.describe('personal-website-v3 E2E Integration Tests', () => {

  test('1. Home Page renders and matches design spec', async ({ page }) => {
    await page.goto('/');
    
    // Check main title / intro
    const mainTitle = page.locator('main h1').first();
    await expect(mainTitle).toContainText('Untung');
    
    // Check profile introduction
    const introText = page.locator('text=I design and build');
    await expect(introText).toBeVisible();

    // Check footer exists
    const footer = page.locator('footer');
    await expect(footer).toContainText('Untung Tanujaya');
  });

  test('2. Resume Page displays timeline, education, and skills', async ({ page }) => {
    await page.goto('/resume');
    
    // Verify timeline title
    const header = page.locator('h2', { hasText: 'Work Experience' });
    await expect(header).toBeVisible();
    
    // Verify experience item (e.g. fr8co)
    const fr8coExp = page.locator('h3', { hasText: 'Software Engineer' });
    await expect(fr8coExp.first()).toBeVisible();
    
    // Verify skills sections
    const skillsHeader = page.locator('h2', { hasText: 'Technical Skills' });
    await expect(skillsHeader).toBeVisible();
    
    // Verify education section
    const eduHeader = page.locator('h2', { hasText: 'Education' });
    await expect(eduHeader).toBeVisible();
  });

  test('3. Projects Page lists items and supports dynamic search', async ({ page }) => {
    await page.goto('/projects');
    
    // Check header
    const title = page.locator('h1', { hasText: 'Featured Projects' });
    await expect(title).toBeVisible();

    // Check project card items are visible
    const projectCards = page.locator('.project-card');
    await expect(projectCards).toHaveCount(4);

    // Search for "Python" and verify filtering works
    const searchInput = page.locator('#project-search');
    await searchInput.fill('Python');
    
    // The search matches "Custom OCR Service" and "The Pilot System" (both have Python in description or tech stack)
    // and hides the others (CEISA, Critical Web Applications)
    const visibleCards = page.locator('.project-card:visible');
    await expect(visibleCards).toHaveCount(2);

    // Search for a non-matching word
    await searchInput.fill('NonExistentStack');
    await expect(page.locator('.project-card:visible')).toHaveCount(0);
    
    // Check empty state
    const emptyState = page.locator('#empty-state');
    await expect(emptyState).toBeVisible();
  });

  test('4. Articles Page loads and renders markdown detail pages', async ({ page }) => {
    await page.goto('/articles');
    
    // Check main header
    const header = page.locator('h1', { hasText: 'Technical Articles' });
    await expect(header).toBeVisible();

    // Check articles list count
    const articleCards = page.locator('.article-card');
    await expect(articleCards).toHaveCount(7);

    // Click on the first article link (optimizing go backends)
    const firstArticle = page.locator('.article-card', { hasText: 'Speeding Up an I/O-Bound' }).first();
    await firstArticle.click();

    // Verify it routes to the detail URL and renders markdown parsed content
    await expect(page).toHaveURL(/\/articles\/optimizing-go-backends/);
    const articleTitle = page.locator('.article-title');
    await expect(articleTitle).toContainText('Speeding Up an I/O-Bound');

    // Verify markdown rendering elements (e.g. h2 headers, code blocks)
    const subHeader = page.locator('h2', { hasText: 'The problem' }).first();
    await expect(subHeader).toBeVisible();
  });

  test('5. Clinical Apps Suite and Medical Calculators function correctly', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('BROWSER EXCEPTION:', err.message));
    
    // Go to apps dashboard
    await page.goto('/apps');
    // Wait for React hydration
    await page.waitForTimeout(2500);
    
    // Launch radiology section
    const radCard = page.getByRole('button', { name: 'Radiology Calculators' });
    await radCard.click();
    await expect(page).toHaveURL(/\/apps\/radiology/);

    // Go to PHQ-9 psychiatry scale directly
    await page.goto('/apps/psychiatry/phq-9');
    
    // Check PHQ-9 header
    const scaleTitle = page.locator('h3', { hasText: 'PHQ-9' });
    await expect(scaleTitle).toBeVisible();

    // Select answers to calculate score
    // Let's click "Several days" (score 1) for the first question
    const firstQuestionRow = page.locator('div[role="radiogroup"]').first();
    const severalDaysBtn = firstQuestionRow.locator('button', { hasText: '+1' });
    await severalDaysBtn.click();

    // Score box should show Score: 1 pts
    const scoreBox = page.locator('text=Score');
    await expect(scoreBox).toBeVisible();
    await expect(scoreBox).toContainText('Score: 1');
  });
});
