import BasePage from './BasePage.js';
import constants from '../utils/constants.js';
import helpers from '../utils/helpers.js';

class StatusesPage extends BasePage {
  constructor(page) {
    super(page);
    this.nameInput = this.page.locator('input[name="name"]').first();
    this.slugInput = this.page.locator('input[name="slug"]').first();
    this.submitButton = this.page.locator('button[type="submit"]').first();
    this.saveButton = this.page.locator(`button:has-text("${constants.tableElements.saveButton}")`).first();
    this.saveChangesButton = this.page.locator(`button:has-text("${constants.tableElements.saveChangesButton}")`).first();
    this.createButton = this.page.locator(`a:has-text("${constants.tableElements.createButton}")`).first();
    
    this.tableRows = this.page.locator('tbody tr');
    this.selectAllCheckbox = this.page.locator('thead input[type="checkbox"]').first();
    this.deleteSelectedButton = this.page.locator(`button:has-text("${constants.tableElements.deleteSelected}")`).first();
    
    this.editButtons = this.page.locator(`button:has-text("${constants.tableElements.editButton}")`);
    this.deleteButtons = this.page.locator(`button:has-text("${constants.tableElements.deleteButton}")`);
    this.confirmButton = this.page.locator(`button:has-text("${constants.tableElements.confirmButton}")`).first();
    
    this.statusesLink = this.page.locator(`a:has-text("${constants.mainPageElements.statusMenuItemLabel}")`).first();
  }

  async goto() {
    await this.click(this.statusesLink);
    await this.page.waitForURL('**/task_statuses');
  }

  async openCreateForm() {
    await this.click(this.createButton);
    await this.waitForElement(this.nameInput, 5000);
  }

  async createStatus(name = null, slug = null) {
    const statusName = name || helpers.generateName('Status');
    const statusSlug = slug || helpers.generateSlug();
    
    await this.openCreateForm();
    await this.fill(this.nameInput, statusName);
    
    if (await this.slugInput.isVisible({ timeout: 3000 })) {
      await this.fill(this.slugInput, statusSlug);
    }
    
    const saveBtn = this.saveButton.or(this.submitButton).first();
    await saveBtn.click();
    await this.page.waitForURL('**/task_statuses', { timeout: 10000 });
    await helpers.waitForPageLoad(this.page);
    
    return { name: statusName, slug: statusSlug };
  }

  async editStatus(oldName, newName, newSlug = null) {
    const statusRow = this.page.locator(`tr:has-text("${oldName}")`).first();
    
    if (await statusRow.isVisible({ timeout: 5000 })) {
      const editButton = statusRow.locator(`button:has-text("${constants.tableElements.editButton}")`).first();
      await editButton.click();
      await this.waitForElement(this.nameInput, 5000);
      await this.fill(this.nameInput, newName);
      
      if (newSlug && await this.slugInput.isVisible({ timeout: 3000 })) {
        await this.fill(this.slugInput, newSlug);
      }
      const saveBtn = this.saveButton.or(this.saveChangesButton).or(this.submitButton).first();
      await saveBtn.click();
      await this.page.waitForURL('**/task_statuses', { timeout: 10000 });
      await helpers.waitForPageLoad(this.page);
      
      return { name: newName, slug: newSlug };
    } else {
      throw new Error(`Status with name ${oldName} not found`);
    }
  }

  async deleteStatus(statusName) {
    const statusRow = this.page.locator(`tr:has-text("${statusName}")`).first();
    
    if (await statusRow.isVisible({ timeout: 5000 })) {
      const deleteButton = statusRow.locator(`button:has-text("${constants.tableElements.deleteButton}")`).first();
      await deleteButton.click();

      if (await this.confirmButton.isVisible({ timeout: 3000 })) {
        await this.confirmButton.click();
      }
      
      await this.page.waitForTimeout(2000);
      
      return true;
    } else {
      return false;
    }
  }

  async massDeleteStatuses() {
    if (await this.selectAllCheckbox.isVisible({ timeout: 3000 })) {
      await this.selectAllCheckbox.check();
      await helpers.waitForTimeout(1000);

      if (await this.deleteSelectedButton.isVisible({ timeout: 3000 })) {
        await this.deleteSelectedButton.click();

        if (await this.confirmButton.isVisible({ timeout: 3000 })) {
          await this.confirmButton.click();
          await helpers.waitForTimeout(2000);
        }
      }
    }
  }

  async getStatusCount() {
    return await this.tableRows.count();
  }

  async isStatusVisible(statusName) {
    const statusRow = this.page.locator(`tr:has-text("${statusName}")`).first();
    return await statusRow.isVisible({ timeout: 3000 });
  }

  async getAllStatuses() {
    const statuses = [];
    const count = await this.getStatusCount();
    
    for (let i = 0; i < count; i++) {
      const row = this.tableRows.nth(i);
      const name = await row.locator('td:nth-child(2)').textContent();
      const slug = await row.locator('td:nth-child(3)').textContent();
      
      statuses.push({ name, slug });
    }
    
    return statuses;
  }

  async verifyStatusDetails(statusName, expectedDetails) {
    const statusRow = this.page.locator(`tr:has-text("${statusName}")`).first();
    
    if (await statusRow.isVisible({ timeout: 3000 })) {
      const actualName = await statusRow.locator('td:nth-child(2)').textContent();
      const actualSlug = await statusRow.locator('td:nth-child(3)').textContent();
      
      return {
        name: actualName === expectedDetails.name,
        slug: actualSlug === expectedDetails.slug
      };
    }
    
    return null;
  }

  async statusExists(statusName) {
    const statusElement = this.page.locator(`text="${statusName}"`).first();
    return await statusElement.isVisible({ timeout: 3000 });
  }
}

export default StatusesPage;