import { test,expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
const sections=['','work/','cv/','research/','research/publications/','writing/','writing/optimizing-go-backends/','tools/','tools/psychiatry/phq-9/','search/'];
for(const locale of ['en','zh'])for(const theme of ['light','dark'])for(const width of [375,768,1024,1440]){
 test(`responsive ${locale} ${theme} ${width}`,async({page})=>{
  await page.setViewportSize({width,height:1000});
  await page.addInitScript(t=>localStorage.setItem('ut-theme',t),theme);
  for(const route of sections){
   await page.goto(`/${locale}/${route}`);
   await expect(page.locator('h1')).toHaveCount(1);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route).toBe(true);
   await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
  }
 });
}
test('navigation, locale context and theme persistence',async({page})=>{
 await page.goto('/en/work/custom-ocr-service-rpa-engine-8/?source=test#content');
 await page.getByLabel('Appearance',{exact:true}).selectOption('dark');
 await page.locator('[data-locale-switch]').click();
 await expect(page).toHaveURL(/\/zh\/work\/custom-ocr-service-rpa-engine-8\/\?source=test#content/);
 await expect(page.locator('html')).toHaveAttribute('lang','zh-Hans');
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await expect(page.locator('h1')).toContainText('定制 OCR');
 await page.goto('/zh/cv/');await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
});
test('system theme follows OS; blocked storage is harmless',async({page})=>{
 await page.emulateMedia({colorScheme:'dark'});await page.goto('/en/');
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.emulateMedia({colorScheme:'light'});await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}})});
 await page.reload();await page.getByLabel('Appearance',{exact:true}).selectOption('dark');await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
});
test('search query, no results, clear, Mandarin',async({page})=>{
 await page.goto('/en/search/?q=Redis');
 expect(await page.locator('.search-item:visible').count()).toBeGreaterThan(0);
 await page.getByRole('searchbox').fill('no-such-zzzzz');await expect(page.locator('#no-results')).toBeVisible();
 await page.getByRole('button',{name:'Clear',exact:true}).click();await expect(page.locator('#no-results')).toBeHidden();
 await page.goto('/zh/search/?q=分布式');expect(await page.locator('.search-item:visible').count()).toBeGreaterThan(0);
});
test('mobile navigation and keyboard skip link',async({page})=>{
 await page.setViewportSize({width:375,height:812});await page.goto('/en/');
 await page.keyboard.press('Tab');await expect(page.getByText('Skip to content',{exact:true})).toBeFocused();
 await page.locator('.mobile-menu summary').click();await page.locator('.mobile-menu nav').getByRole('link',{name:'Research',exact:true}).click();
 await expect(page).toHaveURL(/\/en\/research\//);
});
test('CV retained and printable',async({page})=>{
 await page.goto('/en/cv/');await expect(page.locator('#experience .cv-entry')).toHaveCount(4);await expect(page.locator('#education .cv-entry')).toHaveCount(2);
 await page.locator('.cv-entry summary').first().click();await expect(page.getByText(/opening 367 Pull Requests/)).toBeVisible();
 await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));await page.emulateMedia({media:'print'});
 await expect(page.locator('.site-header')).toBeHidden();expect(await page.locator('.cv-entry details[open]').count()).toBe(4);
});
test('no JavaScript remains readable and navigable',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:812}});const p=await context.newPage();await p.goto('http://127.0.0.1:4324/zh/');
 await expect(p.locator('h1')).toBeVisible();await p.locator('.mobile-menu summary').click();await p.locator('.mobile-menu nav').getByRole('link',{name:'简历',exact:true}).click();await expect(p.locator('h1')).toContainText('Untung');await context.close();
});
test('legacy routes preserve destination and query',async({page})=>{
 await page.goto('/search/?q=Go');await expect(page).toHaveURL(/\/en\/search\/\?q=Go/);
 await page.goto('/articles/optimizing-go-backends/');await expect(page).toHaveURL(/\/en\/writing\/optimizing-go-backends\//);
 await page.goto('/apps/psychiatry/phq-9/');await expect(page).toHaveURL(/\/en\/tools\/psychiatry\/phq-9\//);
});
test('PHQ-9 scoring retains behavior and tools navigate within locale',async({page})=>{
 await page.goto('/zh/tools/psychiatry/phq-9/');
 await page.locator('[role=radiogroup]').first().getByRole('radio').nth(1).click();
 await expect(page.getByText('Score: 1 pts',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Back to Apps',exact:true}).click();await expect(page).toHaveURL(/\/zh\/tools\/psychiatry\//);
});
test('research empty state and feed',async({page,request})=>{
 await page.goto('/en/research/publications/');await expect(page.getByText('No publications to share yet.')).toBeVisible();
 const feed=await request.get('/en/feed.xml');expect(feed.ok()).toBe(true);expect(await feed.text()).toContain('A new chapter at Harbin Institute of Technology');
});
test('all content routes load without browser errors',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 const walk=(dir:string):string[]=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
 const routes=walk('dist/en').filter(x=>x.endsWith('index.html')).map(x=>'/'+x.replace(/^dist\//,'').replace(/index.html$/,''));
 for(const route of routes){const response=await page.goto(route);expect(response?.status(),route).toBe(200);await expect(page.locator('h1')).toHaveCount(1);}
 expect(errors).toEqual([]);
});
test('screenshots for visual review',async({page})=>{
 fs.mkdirSync('test-results/visual',{recursive:true});
 for(const [locale,theme,width] of [['en','light',1440],['en','dark',1440],['zh','light',375],['zh','dark',375]] as const){
  await page.setViewportSize({width,height:1000});await page.goto(`/${locale}/`);await page.locator('#theme').selectOption(theme);await page.screenshot({path:`test-results/visual/home-${locale}-${theme}-${width}.png`,fullPage:true,animations:'disabled'});
 }
 for(const route of ['cv','research','writing/optimizing-go-backends','tools/psychiatry/phq-9','work/custom-ocr-service-rpa-engine-8']){
  await page.setViewportSize({width:1440,height:1000});await page.goto(`/en/${route}/`);await page.locator('#theme').selectOption('light');await page.screenshot({path:`test-results/visual/${route.replaceAll('/','-')}.png`,fullPage:true,animations:'disabled'});
 }
});
