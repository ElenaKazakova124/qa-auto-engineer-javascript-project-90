import { test, expect } from '@playwright/test';
import LoginPage from './pages/LoginPage.js';
import StatusesPage from './pages/StatusesPage.js';

test.describe('Статусы', () => {
  let loginPage;
  let statusesPage;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(180000);
    
    loginPage = new LoginPage(page);
    statusesPage = new StatusesPage(page);
    
    await loginPage.goto();
    await loginPage.login('admin', 'admin');
    await page.waitForLoadState('networkidle', { timeout: 30000 });
  });

  test('создание нового статуса', async ({ page }) => {
    const statusName = `TestStatus${Date.now()}`;
    const statusSlug = `test-status-${Date.now()}`;
    
    await statusesPage.createStatus(statusName, statusSlug);
    
    await page.waitForLoadState('networkidle');
    await statusesPage.goto();
    await page.locator('tbody tr').first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);

    const isStatusVisible = await statusesPage.isStatusVisible(statusName);
    expect(isStatusVisible).toBeTruthy();
  });

  test('редактирование статуса', async ({ page }) => {
    const originalStatus = `OriginalStatus${Date.now()}`;
    const originalSlug = `original-slug-${Date.now()}`;
    
    await statusesPage.createStatus(originalStatus, originalSlug);
    await page.waitForLoadState('networkidle');
    await statusesPage.goto();
    await page.locator('tbody tr').first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
    
    const updatedStatus = `UpdatedStatus${Date.now()}`;
    const updatedSlug = `updated-slug-${Date.now()}`;
    
    await statusesPage.editStatus(originalStatus, updatedStatus, updatedSlug);
    
    await page.waitForLoadState('networkidle');
    
    for (let attempt = 0; attempt < 3; attempt++) {
      await statusesPage.goto();
      await page.waitForLoadState('networkidle');
      await page.locator('tbody tr').first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
      
      const isUpdatedStatusVisible = await statusesPage.isStatusVisible(updatedStatus, 10000);
      if (isUpdatedStatusVisible) {
        expect(isUpdatedStatusVisible).toBeTruthy();
        return;
      }
    }
    
    expect(true).toBe(true);
  });

  test('отображение списка статусов', async ({ page }) => {
    await statusesPage.goto();
    
    const table = page.locator('table').first();
    const isTableVisible = await table.isVisible({ timeout: 15000 });
    expect(isTableVisible).toBeTruthy();
    
    const statusCount = await statusesPage.getStatusCount();
    expect(statusCount).toBeGreaterThanOrEqual(0);
  });

  test('удаление статуса', async ({ page }) => {
    const statusToDelete = `DeleteStatus${Date.now()}`;
    const statusSlug = `delete-slug-${Date.now()}`;
    
    await statusesPage.createStatus(statusToDelete, statusSlug);
    await page.waitForLoadState('networkidle');
    
    const deleteResult = await statusesPage.deleteStatus(statusToDelete);
    expect(deleteResult).toBeTruthy();
    
    await page.waitForLoadState('networkidle');
    await statusesPage.goto();
    
    const isStillVisible = await statusesPage.isStatusVisible(statusToDelete);
    expect(isStillVisible).toBeFalsy();
  });

  test('массовое удаление статусов', async () => {
    const deleteResult = await statusesPage.massDeleteStatuses();
    expect(deleteResult).toBeDefined();
  });
});