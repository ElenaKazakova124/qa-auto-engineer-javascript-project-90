import BasePage from './BasePage.js';
import constants from '../utils/constants.js';
import { expect } from '@playwright/test';

class TasksPage extends BasePage {
  constructor(page) {
    super(page);
    this.createButton = this.page.locator(`a:has-text("${constants.tableElements.createButton}")`);
    this.saveButton = this.page.locator(`button[aria-label="Save"]`);
    this.tasksLink = this.page.locator(`a:has-text("${constants.mainPageElements.tasksMenuItemLabel}")`);
    
    this.assigneeSelection = this.page.getByRole('combobox', { name: 'Assignee' });
    this.titleInput = this.page.getByLabel('Title');
    this.contentInput = this.page.locator('textarea[name="content"]');
    this.statusSelection = this.page.getByRole('combobox', { name: 'Status' });
    this.labelSelection = this.page.getByRole('combobox', { name: 'Label' });
    
    this.successMessage = this.page.locator('.alert-success, .text-success, [class*="success"]');
    this.errorMessage = this.page.locator('.error, .text-danger, .invalid-feedback, [class*="error"]');
    this.createForm = this.page.locator('.RaCreate-card');
  }

  async goto() {
    await this.tasksLink.click();
    await this.page.waitForURL('**/#/tasks', { timeout: 10000 });
  }

  async waitForFormReady() {
    await expect(this.createForm).toBeVisible({ timeout: 15000 });
    
    await expect(this.assigneeSelection).toBeVisible();
    await expect(this.titleInput).toBeVisible();
    await expect(this.contentInput).toBeVisible();
    await expect(this.statusSelection).toBeVisible();
    await expect(this.saveButton).toBeVisible();
  }

  async chooseItem(dropdownLocator, optionIndex = 0) {
    await dropdownLocator.click();
    
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    
    const options = this.page.locator('[role="listbox"] [role="option"]');
    const optionCount = await options.count();
    
    if (optionCount > 0 && optionIndex < optionCount) {
      await options.nth(optionIndex).click();
    } else if (optionCount > 0) {
      await options.first().click();
    }
    
    await this.page.click('body', { position: { x: 10, y: 10 } });
    await this.page.waitForTimeout(300);
  }

  async createTask(title, description = 'Test description') {
    await this.createButton.click();
    
    await this.waitForFormReady();
    
    await this.chooseItem(this.assigneeSelection, 0);
    
    await this.titleInput.fill(title);
    await expect(this.titleInput).toHaveValue(title);
    
    await this.contentInput.fill(description);
    await expect(this.contentInput).toHaveValue(description);
    
    await this.chooseItem(this.statusSelection, 0);
    
    if (await this.labelSelection.isVisible({ timeout: 2000 })) {
      await this.chooseItem(this.labelSelection, 0);
    }
    
    await expect(this.saveButton).toBeEnabled();
    
    await this.saveButton.click();
    
    try {
      await expect(this.createForm).not.toBeVisible({ timeout: 5000 });
    } catch (error) {
      try {
        await expect(this.successMessage).toBeVisible({ timeout: 5000 });
      } catch (e) {
        console.log('Form did not disappear and no success message, but proceeding...');
      }
    }
    
    await this.goto();
  }

  async verifyTaskExists(title) {
    const taskLocator = this.page.locator(`text=${title}`).first();
    return await taskLocator.isVisible({ timeout: 5000 });
  }
}

export default TasksPage;