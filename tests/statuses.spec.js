import { test, expect } from '@playwright/test';
import LoginPage from './pages/LoginPage.js';
import DashboardPage from './pages/DashboardPage.js';
import StatusesPage from './pages/StatusesPage.js';
import helpers from './utils/helpers.js'

test.describe('Статусы', () => {
  let loginPage;
  let dashboardPage;
  let statusesPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    statusesPage = new StatusesPage(page);
    await loginPage.login('admin', 'admin');
    await dashboardPage.waitForDashboard();
  });

  test('создание статуса', async ({ page }) => {
    await statusesPage.goto();
    const statusName = await statusesPage.createStatus();
    await helpers.shouldSee(page, statusName);
  });
});