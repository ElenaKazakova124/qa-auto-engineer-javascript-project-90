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
    
    await tasksPage.goto();
  });

  test('создание задачи', async ({ page }) => {
    const taskTitle = `Page Object Task ${Date.now()}`;
    
    await tasksPage.createTask(taskTitle, 'Test description');
    
    await expect(page.locator(`text=${taskTitle}`).first()).toBeVisible({ timeout: 10000 });
  });
});