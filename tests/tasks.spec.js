import { test, expect } from '@playwright/test';
import LoginPage from './pages/LoginPage.js';
import TasksPage from './pages/TasksPage.js';

test.describe('Задачи', () => {
  let loginPage;
  let tasksPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    tasksPage = new TasksPage(page);
    await loginPage.login('admin', 'admin');
  });

  test('создание задачи', async ({ page }) => {
    await tasksPage.goto('http://localhost:5173/');
    
    const taskTitle = `Page Object Task ${Date.now()}`;
    await tasksPage.createTask(taskTitle, 'Test description');
    
    await page.reload();
    await expect(page.locator(`*:has-text("${taskTitle}")`).first()).toBeVisible();
  });
});