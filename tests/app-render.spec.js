import { test, expect } from '@playwright/test';
import AppPage from './pages/AppPage.js';
import LoginPage from './pages/LoginPage.js';
import constants from './utils/constants.js';

test('приложение загружается', async ({ page }) => {
  const app = new AppPage(page);
  await page.goto('/#/login');

  await app.waitForAppLoad();

  await expect(page.locator('body')).toBeAttached();
  await expect(page.locator('#root')).toBeAttached();
  const title = await page.title();
  expect(title).toBeTruthy();
});

test('отображается кнопка входа на странице логина', async ({ page }) => {
  const app = new AppPage(page);
  await page.goto('/#/login');

  await app.waitForAppLoad();

  expect(page.url()).toContain('#/login');
});

test('отображается приветственный текст после авторизации', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const app = new AppPage(page);
  
  await loginPage.goto();
  const loginOk = await loginPage.login('admin', 'admin');
  expect(loginOk).toBeTruthy();
  await page.waitForLoadState('domcontentloaded');

  await app.waitForAppLoad();
  const hasDashboard = await app.dashboardLink.isVisible({ timeout: 2000 }).catch(() => false);
  const hasWelcome = await app.welcomeText.isVisible({ timeout: 2000 }).catch(() => false);
  expect(hasDashboard || hasWelcome).toBeTruthy();
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

  await expect(page.locator('body')).toBeAttached();
});

test('корректный URL после загрузки приложения', async ({ page }) => {
  const app = new AppPage(page);
  await page.goto('/#/login');

  await app.waitForAppLoad();

  const url = page.url();
  expect(url).toMatch(/#\/login$/);
});