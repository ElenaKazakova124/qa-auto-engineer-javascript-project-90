import { test, expect } from '@playwright/test';
import LoginPage from './pages/LoginPage.js';
import DashboardPage from './pages/DashboardPage.js';
import LabelsPage from './pages/LabelsPage.js';
import helpers from './utils/helpers.js'

test.describe('Метки', () => {
  let loginPage;
  let dashboardPage;
  let labelsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    labelsPage = new LabelsPage(page);
    await loginPage.login('admin', 'admin');
    await dashboardPage.waitForDashboard();
  });

  test('создание метки', async ({ page }) => {
    await labelsPage.goto();
    const labelName = await labelsPage.createLabel();
    await helpers.shouldSee(page, labelName);
  });
});