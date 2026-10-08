import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
 testDir:'./tests', fullyParallel:true, forbidOnly:!!process.env.CI,
 retries:process.env.CI?1:0, workers:4, reporter:'list',
 use:{baseURL:'http://127.0.0.1:4324',trace:'retain-on-failure',launchOptions:{args:['--no-proxy-server']}},
 projects:[{name:'chromium',use:{...devices['Desktop Chrome']}}],
 webServer:{command:'npm run preview -- --host 127.0.0.1 --port 4324',url:'http://127.0.0.1:4324/en/',reuseExistingServer:!process.env.CI},
});
