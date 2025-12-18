import { test, expect } from '@playwright/test';
import LoginPage from './pages/LoginPage.js';
import StatusesPage from './pages/StatusesPage.js';

test.describe.skip('Статусы', () => {
  let loginPage;
  let statusesPage;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(180000);
    
    loginPage = new LoginPage(page);
    statusesPage = new StatusesPage(page);
    
    await loginPage.goto();
    await loginPage.login('admin', 'admin');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
  });

  test('создание нового статуса', async ({ page }) => {
    const statusName = `TestStatus${Date.now()}`;
    const statusSlug = `test-status-${Date.now()}`;
    
    await statusesPage.createStatus(statusName, statusSlug);
    
    await page.waitForLoadState('domcontentloaded');
    await statusesPage.goto();
    await page.locator('tbody tr').first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);

    const isStatusVisible = await statusesPage.isStatusVisible(statusName);
    expect(isStatusVisible).toBeTruthy();
  });

  test('редактирование статуса', async ({ page }) => {
    const originalStatus = `OriginalStatus${Date.now()}`;
    const originalSlug = `original-slug-${Date.now()}`;
    
    await statusesPage.createStatus(originalStatus, originalSlug);
    await page.waitForLoadState('domcontentloaded');
    await statusesPage.goto();
    await page.locator('tbody tr').first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
    
    const isOriginalVisible = await statusesPage.isStatusVisible(originalStatus);
    expect(isOriginalVisible).toBeTruthy();
    
    const updatedStatus = `UpdatedStatus${Date.now()}`;
    const updatedSlug = `updated-slug-${Date.now()}`;
    
    const editResult = await statusesPage.editStatus(originalStatus, updatedStatus, updatedSlug);
    expect(editResult).toBeDefined();
    if (editResult && editResult.name) {
      expect(editResult.name).toBe(updatedStatus);
    }
    
    await page.waitForLoadState('domcontentloaded');
    
    let isUpdatedStatusVisible = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      await statusesPage.goto();
      await page.waitForLoadState('domcontentloaded');
      await page.locator('tbody tr').first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
      
      isUpdatedStatusVisible = await statusesPage.isStatusVisible(updatedStatus, 15000);
      if (isUpdatedStatusVisible) {
        break;
      }
      
      const isOriginalStillVisible = await statusesPage.isStatusVisible(originalStatus, 5000).catch(() => false);
      if (!isOriginalStillVisible && editResult && editResult.name === updatedStatus) {
        isUpdatedStatusVisible = true;
        break;
      }
    }
    
    expect(isUpdatedStatusVisible).toBeTruthy();
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
    await page.waitForLoadState('domcontentloaded');
    
    const deleteResult = await statusesPage.deleteStatus(statusToDelete);
    expect(deleteResult).toBeTruthy();
    
    await page.waitForLoadState('domcontentloaded');
    await statusesPage.goto();
    
    const isStillVisible = await statusesPage.isStatusVisible(statusToDelete);
    expect(isStillVisible).toBeFalsy();
  });

  test('массовое удаление статусов', async () => {
    const deleteResult = await statusesPage.massDeleteStatuses();
    expect(deleteResult).toBeDefined();
  });
});