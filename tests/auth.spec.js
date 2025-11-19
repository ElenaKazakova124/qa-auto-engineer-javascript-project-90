import { test, expect } from '@playwright/test';
import LoginPage from './pages/LoginPage.js';
import DashboardPage from './pages/DashboardPage.js';
import constants from './utils/constants.js';
import helpers from './utils/helpers.js'

test.describe('авторизация и выход', () => {
  let loginPage;
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('успешная авторизация', async ({ page }) => {
    await loginPage.login('admin', 'admin');
    await dashboardPage.waitForDashboard();
    await helpers.shouldSee(page, constants.mainPageElements.welcomeText);
  });

  test('выход из системы', async ({ page }) => {
    await loginPage.login('admin', 'admin');
    await dashboardPage.waitForDashboard();
    await dashboardPage.logout();
    await expect(loginPage.signInButton).toBeVisible({ timeout: 10000 });
  });
});