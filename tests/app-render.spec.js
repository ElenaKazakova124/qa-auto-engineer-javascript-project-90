import { test, expect } from '@playwright/test';
import AppPage from './pages/AppPage.js';
import LoginPage from './pages/LoginPage.js';
import constants from './utils/constants.js';

test('приложение загружается', async ({ page }) => {
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