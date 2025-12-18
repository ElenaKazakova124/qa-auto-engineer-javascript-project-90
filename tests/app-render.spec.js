import { test, expect } from '@playwright/test';
import AppPage from './pages/AppPage.js';
import LoginPage from './pages/LoginPage.js';
import constants from './utils/constants.js';

test('приложение загружается', async ({ page }) => {
  // #region agent log
  page.on('pageerror', (err) => {
    // eslint-disable-next-line no-console
    console.log(`[pw-pageerror] ${err?.message || err}`);
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      // eslint-disable-next-line no-console
      console.log(`[pw-console-error] ${msg.text()}`);
    }
  });
  page.on('requestfailed', (req) => {
    // eslint-disable-next-line no-console
    console.log(`[pw-requestfailed] ${req.method()} ${req.url()} :: ${req.failure()?.errorText || 'unknown'}`);
  });
  page.on('response', (res) => {
    const status = res.status();
    if (status >= 400 && (res.request().resourceType() === 'document' || res.request().resourceType() === 'script')) {
      // eslint-disable-next-line no-console
      console.log(`[pw-response] ${status} ${res.request().resourceType()} ${res.url()}`);
    }
  });
  // #endregion

  const app = new AppPage(page);
  await page.goto('/');

  await app.waitForAppLoad();

  expect(await app.isAppLoaded()).toBeTruthy();
});

test('отображается кнопка входа на странице логина', async ({ page }) => {
  const app = new AppPage(page);
  await page.goto('/');

  await app.waitForAppLoad();

  const isSignInVisible = await app.signInButton.isVisible();
  expect(isSignInVisible).toBeTruthy();
});

test('отображается приветственный текст после авторизации', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const app = new AppPage(page);
  
  await loginPage.goto();
  await loginPage.login('admin', 'admin');
  await page.waitForLoadState('domcontentloaded');

  const isWelcomeVisible = await app.welcomeText.isVisible({ timeout: 10000 });
  expect(isWelcomeVisible).toBeTruthy();
});

test('отображаются основные элементы меню навигации', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.goto();
  await loginPage.login('admin', 'admin');
  await page.waitForLoadState('domcontentloaded');

  const menuItems = [
    constants.mainPageElements.dashboardMenuItemLabel,
    constants.mainPageElements.tasksMenuItemLabel,
    constants.mainPageElements.usersMenuItemLabel,
    constants.mainPageElements.labelsMenuItemLabel,
    constants.mainPageElements.statusesMenuItemLabel
  ];

  for (const menuItem of menuItems) {
    const menuElement = page.locator(`a:has-text("${menuItem}")`).first();
    const isVisible = await menuElement.isVisible({ timeout: 5000 });
    expect(isVisible).toBeTruthy();
  }
});

test('корректный URL после загрузки приложения', async ({ page }) => {
  const app = new AppPage(page);
  await page.goto('/');

  await app.waitForAppLoad();

  const url = page.url();
  // App may redirect to the login route depending on auth state
  expect(url).toMatch(/\/(#\/login)?$/);
});