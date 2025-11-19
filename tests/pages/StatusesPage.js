import BasePage from './BasePage.js';
import constants from '../utils/constants.js';

class StatusesPage extends BasePage {
  constructor(page) {
    super(page);
    this.createButton = this.page.locator(`a:has-text("${constants.tableElements.createButton}")`).first();
    this.nameInput = this.page.locator('input[name="name"]').first();
    this.slugInput = this.page.locator('input[name="slug"]').first();
    this.saveButton = this.page.locator(`button:has-text("${constants.tableElements.saveButton}")`).first();
    this.taskStatusesLink = this.page.locator(`a:has-text("${constants.mainPageElements.statusMenuItemLabel}")`).first();
  }

  async goto() {
    await this.click(this.taskStatusesLink);
    await this.page.waitForURL('**/task_statuses');
    console.log('Task statuses page loaded successfully');
  }

  async openCreateForm() {
    console.log('Opening create form for task statuses...');
    await this.click(this.createButton);
  }

  async createStatus(name = null, slug = null) {
    const statusName = name || `TestStatus${Date.now()}`;
    const statusSlug = slug || `test-status-${Date.now()}`;
    await this.openCreateForm();
    await this.fill(this.nameInput, statusName);
    await this.fill(this.slugInput, statusSlug);
    await this.click(this.saveButton);
    return statusName;
  }
}

export default StatusesPage;