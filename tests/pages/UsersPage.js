import { expect } from '@playwright/test';
import BasePage from './BasePage.js';
import helpers from '../utils/helpers.js';

class UsersPage extends BasePage {
  constructor(page) {
    super(page);
    
    this.usersLink = this.page.locator('a:has-text("Users")').first();
    
    this.tableRows = this.page.locator('tbody tr');
    this.selectAllCheckbox = this.page.locator('thead input[type="checkbox"]').first();
    this.rowCheckboxes = this.page.locator('tbody input[type="checkbox"]');
    this.emailInput = this.page.locator('input[name="email"], input[type="email"]').first();
    this.firstNameInput = this.page.locator('input[name="firstName"], input[name="first_name"]').first();
    this.lastNameInput = this.page.locator('input[name="lastName"], input[name="last_name"]').first();
    this.saveButton = this.page.locator('button:has-text("Save")').first();
    this.createButton = this.page.locator('a:has-text("Create")').first();
    this.snackbar = this.page.locator('.MuiSnackbar-root, [role="alert"], .snackbar, .toast').first();
    this.undoButton = this.page.locator('button:has-text("UNDO")').first();
  }

  async goto() {
    await expect(this.usersLink).toBeVisible({ timeout: 15000 });
    await this.usersLink.click();
    await expect(this.createButton).toBeVisible({ timeout: 15000 });
  }

  async openCreateForm() {
    await this.goto();
    await expect(this.createButton).toBeVisible({ timeout: 15000 });
    await this.createButton.click();
    await expect(this.emailInput).toBeVisible({ timeout: 15000 });
    await expect(this.firstNameInput).toBeVisible({ timeout: 15000 });
    await expect(this.lastNameInput).toBeVisible({ timeout: 15000 });
  }

  async createUser(email = null, firstName = null, lastName = null) {
    const userEmail = email || `test${Date.now()}@example.com`;
    const userFirstName = firstName || `FirstName${Date.now()}`;
    const userLastName = lastName || `LastName${Date.now()}`;
    
    await this.openCreateForm();
    await this.fill(this.emailInput, userEmail);
    await this.fill(this.firstNameInput, userFirstName);
    await this.fill(this.lastNameInput, userLastName);
    await expect(this.saveButton).toBeVisible({ timeout: 15000 });
    await this.click(this.saveButton);
    await this.page.waitForLoadState('domcontentloaded');
    
    return { email: userEmail, firstName: userFirstName, lastName: userLastName };
  }

  async editUser(oldEmail, newData) {
    const userRow = this.page.locator('tbody tr').filter({ hasText: oldEmail }).first();
    await this.goto();
    await expect(userRow).toBeVisible({ timeout: 15000 });
    await userRow.click({ force: true });
    await expect(this.emailInput).toBeVisible({ timeout: 15000 });
    await expect(this.firstNameInput).toBeVisible({ timeout: 15000 });
    await expect(this.lastNameInput).toBeVisible({ timeout: 15000 });
    if (newData.email !== undefined && newData.email !== null) {
      await this.clear(this.emailInput);
      await this.fill(this.emailInput, newData.email);
    }
    if (newData.firstName !== undefined && newData.firstName !== null) {
      await this.clear(this.firstNameInput);
      await this.fill(this.firstNameInput, newData.firstName);
    }
    if (newData.lastName !== undefined && newData.lastName !== null) {
      await this.clear(this.lastNameInput);
      await this.fill(this.lastNameInput, newData.lastName);
    }
    await expect(this.saveButton).toBeVisible({ timeout: 15000 });
    await this.click(this.saveButton);
    await this.page.waitForLoadState('domcontentloaded');
    return newData;
  }

  async deleteUser(email) {
    await this.goto();
    const userRow = this.page.locator('tbody tr').filter({ hasText: email }).first();
    await expect(userRow).toBeVisible({ timeout: 15000 });
    const checkbox = userRow.locator('td:first-child input[type="checkbox"]').first();
    await expect(checkbox).toBeVisible({ timeout: 15000 });
    await checkbox.check({ force: true });
    const bulkDeleteButton = this.page.locator('button:has-text("Delete"):visible').first();
    await expect(bulkDeleteButton).toBeVisible({ timeout: 15000 });
    await bulkDeleteButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    await expect(userRow).toBeHidden({ timeout: 15000 });
    return true;
  }

  async massDeleteUsers() {
    await this.goto();
    await expect(this.selectAllCheckbox).toBeVisible({ timeout: 15000 });
    await this.selectAllCheckbox.check({ force: true });
    const bulkDeleteButton = this.page.locator('button:has-text("Delete"):visible').first();
    await expect(bulkDeleteButton).toBeVisible({ timeout: 15000 });
    await bulkDeleteButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    return true;
  }

  async getUserCount() {
    const count = await this.tableRows.count();
    return count;
  }

  async isUserVisible(email, timeout = 10000) {
    const userRow = this.page.locator('tbody tr').filter({ hasText: email }).first();
    const isVisible = await userRow.isVisible({ timeout }).catch(() => false);
    
    if (!isVisible) {
      const pageText = await this.page.textContent('body', { timeout: 2000 }).catch(() => '');
      return pageText && pageText.includes(email);
    }
    
    return isVisible;
  }
}

export default UsersPage;