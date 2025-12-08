import { test } from '@playwright/test';
import LoginPage from './pages/LoginPage.js';
import DashboardPage from './pages/DashboardPage.js';
import UsersPage from './pages/UsersPage.js';
import helpers from './utils/helpers.js'

test.describe('Пользователи', () => {
  let loginPage;
  let dashboardPage;
  let usersPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    usersPage = new UsersPage(page);
    await loginPage.login('admin', 'admin');
    await dashboardPage.waitForDashboard();
  });

  test('создание пользователя', async ({ page }) => {
    await usersPage.goto();
    const userEmail = await usersPage.createUser();
    await helpers.shouldSee(page, userEmail);
  });
});