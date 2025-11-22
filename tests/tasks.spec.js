import { test, expect } from '@playwright/test';
import LoginPage from './pages/LoginPage.js';
import TasksPage from './pages/TasksPage.js';

test.describe('Задачи', () => {
  let loginPage;
  let tasksPage;

  test.beforeEach(async ({ page }) => {
    console.log();
    loginPage = new LoginPage(page);
    tasksPage = new TasksPage(page);
    await loginPage.login('admin', 'admin');
    await tasksPage.goto();
    console.log('Test setup completed');
  });

  test('создание задачи', async ({ page }) => {
    console.log();
    
    await expect(page).toHaveURL(/.*\/tasks/);
    console.log('On tasks page, URL:', page.url());
    
    const taskTitle = `Page Object Task ${Date.now()}`;
    console.log('Task title:', taskTitle);
    
    await tasksPage.createTask(taskTitle, 'Test description');
    await expect(page.locator(`text=${taskTitle}`).first()).toBeVisible({ timeout: 10000 });
    
    console.log();
  });
});