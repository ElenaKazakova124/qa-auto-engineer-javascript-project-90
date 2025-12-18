import { expect } from '@playwright/test';
import BasePage from './BasePage.js';
import helpers from '../utils/helpers.js';

class LabelsPage extends BasePage {
  constructor(page) {
    super(page);
    
    this.labelsLink = this.page.locator('a:has-text("Labels")').first();
    
    this.tableRows = this.page.locator('tbody tr');
    this.selectAllCheckbox = this.page.locator('thead input[type="checkbox"]').first();
    this.rowCheckboxes = this.page.locator('tbody input[type="checkbox"]');
    
    this.nameInput = this.page.locator('input[name="name"]').first();
    this.saveButton = this.page.locator('button:has-text("Save")').first();
    
    this.createButton = this.page.locator('a:has-text("Create")').first();
    
    this.snackbar = this.page.locator('.MuiSnackbar-root, [role="alert"], .snackbar, .toast').first();
    this.undoButton = this.page.locator('button:has-text("UNDO")').first();
  }

  async goto() {
    await expect(this.labelsLink).toBeVisible({ timeout: 15000 });
    await this.labelsLink.click();
    await expect(this.createButton).toBeVisible({ timeout: 15000 });
  }

  async openCreateForm() {
    await this.goto();
    await expect(this.createButton).toBeVisible({ timeout: 15000 });
    await this.createButton.click();
    await expect(this.nameInput).toBeVisible({ timeout: 15000 });
  }

  async createLabel(name = null) {
    const labelName = name || `Label${Date.now()}`;

    await this.openCreateForm();
    await this.fill(this.nameInput, labelName);
    await expect(this.saveButton).toBeVisible({ timeout: 15000 });
    await this.click(this.saveButton);
    await this.page.waitForLoadState('domcontentloaded');
    return labelName;
  }

  async editLabel(oldName, newName) {
    const labelRow = this.page.locator('tbody tr').filter({ hasText: oldName }).first();
    await this.goto();
    await expect(labelRow).toBeVisible({ timeout: 15000 });
    await labelRow.click({ force: true });
    await expect(this.nameInput).toBeVisible({ timeout: 15000 });
    await this.clear(this.nameInput);
    await this.fill(this.nameInput, newName);
    await expect(this.saveButton).toBeVisible({ timeout: 15000 });
    await this.click(this.saveButton);
    await this.page.waitForLoadState('domcontentloaded');
    return newName;
  }

  async deleteLabel(labelName) {
    await this.goto();
    const labelRow = this.page.locator('tbody tr').filter({ hasText: labelName }).first();
    await expect(labelRow).toBeVisible({ timeout: 15000 });
    const checkbox = labelRow.locator('td:first-child input[type="checkbox"]').first();
    await expect(checkbox).toBeVisible({ timeout: 15000 });
    await checkbox.check({ force: true });
    const bulkDeleteButton = this.page.locator('button:has-text("Delete"):visible').first();
    await expect(bulkDeleteButton).toBeVisible({ timeout: 15000 });
    await bulkDeleteButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    await expect(labelRow).toBeHidden({ timeout: 15000 });
    return true;
  }

  async massDeleteLabels() {
    await this.goto();
    const testLabels = [];
    for (let i = 1; i <= 3; i++) {
      const labelName = `TestLabel${i}_${Date.now()}`;
      await this.createLabel(labelName);
      testLabels.push(labelName);
    }
    await this.goto();
    
    for (const labelName of testLabels) {
      const labelRow = this.page.locator('tbody tr').filter({ hasText: labelName }).first();
      await expect(labelRow).toBeVisible({ timeout: 15000 });
      const checkbox = labelRow.locator('td:first-child input[type="checkbox"]').first();
      await expect(checkbox).toBeVisible({ timeout: 15000 });
      await checkbox.check({ force: true });
    }
    
    const bulkDeleteButton = this.page.locator('button:has-text("Delete"):visible').first();
    await expect(bulkDeleteButton).toBeVisible({ timeout: 15000 });
    await bulkDeleteButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.goto();
    for (const labelName of testLabels) {
      const row = this.page.locator('tbody tr').filter({ hasText: labelName }).first();
      await expect(row).toBeHidden({ timeout: 15000 });
    }
    return true;
  }

  async getLabelCount() {
    const count = await this.tableRows.count();
    return count;
  }

  async isLabelVisible(labelName, timeout = 10000) {
    const labelRow = this.page.locator('tbody tr').filter({ hasText: labelName }).first();
    const isVisible = await labelRow.isVisible({ timeout }).catch(() => false);
    
    if (!isVisible) {
      const pageText = await this.page.textContent('body', { timeout: 2000 }).catch(() => '');
      return pageText && pageText.includes(labelName);
    }
    
    return isVisible;
  }
}

export default LabelsPage;