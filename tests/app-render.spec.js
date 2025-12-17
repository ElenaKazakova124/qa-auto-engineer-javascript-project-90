import { test, expect } from '@playwright/test';
import AppPage from '/Users/Elena/qa-auto-engineer-javascript-project-90/tests/pages/AppPage.js';

test('приложение загружается', async ({ page }) => {
  const app = new AppPage(page);
  await page.goto('http://localhost:5173/');

  await app.waitForAppLoad();

  expect(await app.isAppLoaded()).toBeTruthy();
});