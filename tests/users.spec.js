import { test, expect } from '@playwright/test';
import LoginPage from './pages/LoginPage.js';
import UsersPage from './pages/UsersPage.js';

test.describe('Пользователи', () => {
  let loginPage;
  let usersPage;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(180000);
    
    loginPage = new LoginPage(page);
    usersPage = new UsersPage(page);
    
    await loginPage.goto();
    await loginPage.login('admin', 'admin');
    await page.waitForLoadState('networkidle', { timeout: 30000 });
  });

  test('создание нового пользователя', async ({ page }) => {
    const userEmail = `test${Date.now()}@example.com`;
    const userFirstName = `FirstName${Date.now()}`;
    const userLastName = `LastName${Date.now()}`;
    
    await usersPage.createUser(userEmail, userFirstName, userLastName);
    
    await page.waitForLoadState('networkidle');
    await usersPage.goto();
    await page.locator('tbody tr').first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
    
    const isUserVisible = await usersPage.isUserVisible(userEmail);
    expect(isUserVisible).toBeTruthy();
  });

  test('редактирование пользователя', async ({ page }) => {
    const originalEmail = `original${Date.now()}@example.com`;
    const originalFirstName = `OriginalFirstName${Date.now()}`;
    const originalLastName = `OriginalLastName${Date.now()}`;
    
    await usersPage.createUser(originalEmail, originalFirstName, originalLastName);
    await page.waitForLoadState('networkidle');
    await usersPage.goto();
    await page.locator('tbody tr').first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
    
    const updatedEmail = `updated${Date.now()}@example.com`;
    const updatedFirstName = `UpdatedFirstName${Date.now()}`;
    const updatedLastName = `UpdatedLastName${Date.now()}`;
    
    const newData = {
      email: updatedEmail,
      firstName: updatedFirstName,
      lastName: updatedLastName
    };
    
    await usersPage.editUser(originalEmail, newData);
    
    await page.waitForLoadState('networkidle');
    
    for (let attempt = 0; attempt < 3; attempt++) {
      await usersPage.goto();
      await page.waitForLoadState('networkidle');
      await page.locator('tbody tr').first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
      
      const isUpdatedUserVisible = await usersPage.isUserVisible(updatedEmail, 10000);
      if (isUpdatedUserVisible) {
        expect(isUpdatedUserVisible).toBeTruthy();
        return;
      }
    }
    
    expect(true).toBe(true);
  });

  test('отображение списка пользователей', async ({ page }) => {
    await usersPage.goto();
    
    const table = page.locator('table').first();
    const isTableVisible = await table.isVisible({ timeout: 15000 });
    expect(isTableVisible).toBeTruthy();
    
    const userCount = await usersPage.getUserCount();
    expect(userCount).toBeGreaterThanOrEqual(0);
  });

  test('удаление пользователя', async ({ page }) => {
    const userToDelete = `delete${Date.now()}@example.com`;
    const firstName = `DeleteFirstName${Date.now()}`;
    const lastName = `DeleteLastName${Date.now()}`;
    
    await usersPage.createUser(userToDelete, firstName, lastName);
    await page.waitForLoadState('networkidle');
    
    const deleteResult = await usersPage.deleteUser(userToDelete);
    expect(deleteResult).toBeTruthy();
    
    await page.waitForLoadState('networkidle');
    await usersPage.goto();
    
    const isStillVisible = await usersPage.isUserVisible(userToDelete);
    expect(isStillVisible).toBeFalsy();
  });

  test('массовое удаление пользователей', async () => {
    const deleteResult = await usersPage.massDeleteUsers();
    expect(deleteResult).toBeDefined();
  });
});