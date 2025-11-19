import { test, expect } from '@playwright/test';
import LoginPage from './pages/LoginPage.js';
import DashboardPage from './pages/DashboardPage.js';
import constants from './utils/constants.js';
import helpers from './utils/helpers.js'

test.describe('Проверка дашборда и навигации', () => {
  let loginPage;
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.login('admin', 'admin');
  });

  test('дашборд успешно загружается после авторизации', async ({ page }) => {
    await dashboardPage.waitForDashboard();
    await helpers.shouldSee(page, constants.mainPageElements.welcomeText);
  });

  test('навигация по разделам работает корректно', async ({ page }) => {
    await dashboardPage.waitForDashboard();
    
    await dashboardPage.gotoTasks();
    await helpers.shouldBeOnPage(page, /.*\/tasks/);
    
    await dashboardPage.gotoUsers();
    await helpers.shouldBeOnPage(page, /.*\/users/);
    
    await dashboardPage.gotoLabels();
    await helpers.shouldBeOnPage(page, /.*\/labels/);
    
    await dashboardPage.gotoTaskStatuses();
    await helpers.shouldBeOnPage(page, /.*\/task_statuses/);
  });
});