import { test, expect } from '@playwright/test';
import LoginPage from './pages/LoginPage.js';
import DashboardPage from './pages/DashboardPage.js';

test.describe('Авторизация и выход', () => {
  test('успешная авторизация', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    await loginPage.goto();
    await loginPage.login('admin', 'admin');
    await dashboardPage.waitForDashboard();
  });

  test('успешный выход из системы', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    await loginPage.goto();
    await loginPage.login('admin', 'admin');
    await dashboardPage.waitForDashboard();
    
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    await page.goto('/');
    
    await expect(loginPage.signInButton).toBeVisible({ timeout: 10000 });
  });
});