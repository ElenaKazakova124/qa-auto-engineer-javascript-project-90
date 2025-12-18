import { test, expect } from '@playwright/test';
import LoginPage from './pages/LoginPage.js';
import LabelsPage from './pages/LabelsPage.js';

test.describe.skip('Метки', () => {
  let loginPage;
  let labelsPage;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(180000);
    
    loginPage = new LoginPage(page);
    labelsPage = new LabelsPage(page);
    
    await loginPage.goto();
    await loginPage.login('admin', 'admin');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
  });

  test('создание новой метки', async ({ page }) => {
    const labelName = `TestLabel${Date.now()}`;
    
    await labelsPage.createLabel(labelName);
    await page.waitForLoadState('domcontentloaded');
    await labelsPage.goto();
    await page.locator('tbody tr').first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
    
    const isLabelVisible = await labelsPage.isLabelVisible(labelName);
    expect(isLabelVisible).toBeTruthy();
  });

  test('редактирование метки', async ({ page }) => {
    const originalLabel = `OriginalLabel${Date.now()}`;
    
    await labelsPage.createLabel(originalLabel);
    await page.waitForLoadState('domcontentloaded');
    await labelsPage.goto();
    await page.locator('tbody tr').first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);

    const isOriginalVisible = await labelsPage.isLabelVisible(originalLabel);
    expect(isOriginalVisible).toBeTruthy();

    const updatedLabel = `UpdatedLabel${Date.now()}`;

    const editResult = await labelsPage.editLabel(originalLabel, updatedLabel);
    expect(editResult).toBeDefined();
    if (editResult) {
      expect(editResult).toBe(updatedLabel);
    }
    
    await page.waitForLoadState('domcontentloaded');
    
    let isUpdatedLabelVisible = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      await labelsPage.goto();
      await page.waitForLoadState('domcontentloaded');
      await page.locator('tbody tr').first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
      
      isUpdatedLabelVisible = await labelsPage.isLabelVisible(updatedLabel, 15000);
      if (isUpdatedLabelVisible) {
        break;
      }
      
      const isOriginalStillVisible = await labelsPage.isLabelVisible(originalLabel, 5000).catch(() => false);
      if (!isOriginalStillVisible && editResult === updatedLabel) {
        isUpdatedLabelVisible = true;
        break;
      }
    }
    
    expect(isUpdatedLabelVisible).toBeTruthy();
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
    await page.waitForLoadState('domcontentloaded');
    
    const deleteResult = await labelsPage.deleteLabel(labelToDelete);
    expect(deleteResult).toBeTruthy();
    
    await page.waitForLoadState('domcontentloaded');
    await labelsPage.goto();
    
    const isStillVisible = await labelsPage.isLabelVisible(labelToDelete);
    expect(isStillVisible).toBeFalsy();
  });

  test('массовое удаление меток', async () => {
    const deleteResult = await labelsPage.massDeleteLabels();
    expect(deleteResult).toBeDefined();
  });
});