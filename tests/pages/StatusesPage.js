import { expect } from '@playwright/test';
import BasePage from './BasePage.js';

class StatusesPage extends BasePage {
  constructor(page) {
    super(page);
    
    this.statusesLink = this.page.locator('a:has-text("Task statuses")').first();
    
    this.tableRows = this.page.locator('tbody tr');
    this.selectAllCheckbox = this.page.locator('thead input[type="checkbox"]').first();
    this.rowCheckboxes = this.page.locator('tbody input[type="checkbox"]');
    
    this.nameInput = this.page.locator('input[name="name"]').first();
    this.slugInput = this.page.locator('input[name="slug"]').first();
    this.saveButton = this.page.locator('button:has-text("Save")').first();
    
    this.createButton = this.page.locator('a:has-text("Create")').first();
    
    this.snackbar = this.page.locator('.MuiSnackbar-root, [role="alert"], .snackbar, .toast').first();
    this.undoButton = this.page.locator('button:has-text("UNDO")').first();
  }

  async goto() {
    await expect(this.statusesLink).toBeVisible({ timeout: 15000 });
    await this.statusesLink.click();
    await expect(this.createButton).toBeVisible({ timeout: 15000 });
  }

  async openCreateForm() {
    await this.goto();
    await expect(this.createButton).toBeVisible({ timeout: 15000 });
    await this.createButton.click();
    await expect(this.nameInput).toBeVisible({ timeout: 15000 });
    await expect(this.slugInput).toBeVisible({ timeout: 15000 });
  }

  async createStatus(name = null, slug = null) {
    const statusName = name || `Status${Date.now()}`;
    const statusSlug = slug || `status-${Date.now()}`;
    
    await this.openCreateForm();
    await this.fill(this.nameInput, statusName);
    await this.fill(this.slugInput, statusSlug);
    await expect(this.saveButton).toBeVisible({ timeout: 15000 });
    await this.click(this.saveButton);
    await this.page.waitForLoadState('domcontentloaded');
    
    return { name: statusName, slug: statusSlug };
  }

  async editStatus(oldName, newName, newSlug = null) {
    const statusRow = this.page.locator('tbody tr').filter({ hasText: oldName }).first();
    await this.goto();
    await expect(statusRow).toBeVisible({ timeout: 15000 });
    await statusRow.click({ force: true });
    await expect(this.nameInput).toBeVisible({ timeout: 15000 });
    await expect(this.slugInput).toBeVisible({ timeout: 15000 });
    await this.clear(this.nameInput);
    await this.fill(this.nameInput, newName);
    if (newSlug !== null) {
      await this.clear(this.slugInput);
      await this.fill(this.slugInput, newSlug);
    }
    await expect(this.saveButton).toBeVisible({ timeout: 15000 });
    await this.click(this.saveButton);
    await this.page.waitForLoadState('domcontentloaded');
    return { name: newName, slug: newSlug };
  }

  async deleteStatus(statusName) {
    await this.goto();
    const statusRow = this.page.locator('tbody tr').filter({ hasText: statusName }).first();
    await expect(statusRow).toBeVisible({ timeout: 15000 });
    const checkbox = statusRow.locator('td:first-child input[type="checkbox"]').first();
    await expect(checkbox).toBeVisible({ timeout: 15000 });
    await checkbox.check({ force: true });
    const bulkDeleteButton = this.page.locator('button:has-text("Delete"):visible').first();
    await expect(bulkDeleteButton).toBeVisible({ timeout: 15000 });
    await bulkDeleteButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    await expect(statusRow).toBeHidden({ timeout: 15000 });
    return true;
  }

  async massDeleteStatuses() {
    await this.goto();
    const testStatuses = [];
    for (let i = 1; i <= 3; i++) {
      const statusName = `TestStatus${i}_${Date.now()}`;
      const statusSlug = `test-status-${i}-${Date.now()}`;
      await this.createStatus(statusName, statusSlug);
      testStatuses.push(statusName);
    }
    await this.goto();
    
    for (const statusName of testStatuses) {
      const statusRow = this.page.locator('tbody tr').filter({ hasText: statusName }).first();
      await expect(statusRow).toBeVisible({ timeout: 15000 });
      const checkbox = statusRow.locator('td:first-child input[type="checkbox"]').first();
      await expect(checkbox).toBeVisible({ timeout: 15000 });
      await checkbox.check({ force: true });
    }
    
    const bulkDeleteButton = this.page.locator('button:has-text("Delete"):visible').first();
    await expect(bulkDeleteButton).toBeVisible({ timeout: 15000 });
    await bulkDeleteButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.goto();
    for (const statusName of testStatuses) {
      const row = this.page.locator('tbody tr').filter({ hasText: statusName }).first();
      await expect(row).toBeHidden({ timeout: 15000 });
    }
    return true;
  }

  async getStatusCount() {
    const count = await this.tableRows.count();
    return count;
  }

  async isStatusVisible(statusName, timeout = 10000) {
    const statusRow = this.page.locator('tbody tr').filter({ hasText: statusName }).first();
    const isVisible = await statusRow.isVisible({ timeout }).catch(() => false);
    
    if (!isVisible) {
      const pageText = await this.page.textContent('body', { timeout: 2000 }).catch(() => '');
      return pageText && pageText.includes(statusName);
    }
    
    return isVisible;
  }
}

export default StatusesPage;