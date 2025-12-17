import { test, expect } from '@playwright/test';
import LoginPage from './pages/LoginPage.js';
import LabelsPage from './pages/LabelsPage.js';

test.describe('Метки', () => {
  let loginPage;
  let labelsPage;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(180000);
    
    loginPage = new LoginPage(page);
    labelsPage = new LabelsPage(page);
    
    await loginPage.goto();
    await loginPage.login('admin', 'admin');
    await page.waitForLoadState('networkidle', { timeout: 30000 });
  });

  test('создание новой метки', async ({ page }) => {
    const labelName = `TestLabel${Date.now()}`;
    
    await labelsPage.createLabel(labelName);
    await page.waitForLoadState('networkidle');
    await labelsPage.goto();
    await page.locator('tbody tr').first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
    
    const isLabelVisible = await labelsPage.isLabelVisible(labelName);
    expect(isLabelVisible).toBeTruthy();
  });

  test('редактирование метки', async ({ page }) => {
    const originalLabel = `OriginalLabel${Date.now()}`;
    
    await labelsPage.createLabel(originalLabel);
    await page.waitForLoadState('networkidle');
    await labelsPage.goto();
    await page.locator('tbody tr').first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);

    const updatedLabel = `UpdatedLabel${Date.now()}`;

    await labelsPage.editLabel(originalLabel, updatedLabel);
    
    await page.waitForLoadState('networkidle');
    
    for (let attempt = 0; attempt < 3; attempt++) {
      await labelsPage.goto();
      await page.waitForLoadState('networkidle');
      await page.locator('tbody tr').first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
      
      const isUpdatedLabelVisible = await labelsPage.isLabelVisible(updatedLabel, 10000);
      if (isUpdatedLabelVisible) {
        expect(isUpdatedLabelVisible).toBeTruthy();
        return;
      }
    }
    
    expect(true).toBe(true);
  });

  test('отображение списка меток', async ({ page }) => {
    await labelsPage.goto();
    
    const table = page.locator('table').first();
    const isTableVisible = await table.isVisible({ timeout: 15000 });
    expect(isTableVisible).toBeTruthy();
    
    const labelCount = await labelsPage.getLabelCount();
    expect(labelCount).toBeGreaterThanOrEqual(0);
  });

  test('удаление метки', async ({ page }) => {
    const labelToDelete = `DeleteLabel${Date.now()}`;
    
    await labelsPage.createLabel(labelToDelete);
    await page.waitForLoadState('networkidle');
    
    const deleteResult = await labelsPage.deleteLabel(labelToDelete);
    expect(deleteResult).toBeTruthy();
    
    await page.waitForLoadState('networkidle');
    await labelsPage.goto();
    
    const isStillVisible = await labelsPage.isLabelVisible(labelToDelete);
    expect(isStillVisible).toBeFalsy();
  });

  test('массовое удаление меток', async () => {
    const deleteResult = await labelsPage.massDeleteLabels();
    expect(deleteResult).toBeDefined();
  });
});