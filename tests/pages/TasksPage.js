import BasePage from './BasePage.js';
import constants from '../utils/constants.js';

class TasksPage extends BasePage {
  constructor(page) {
    super(page);
    this.createButton = this.page.locator(`a:has-text("${constants.tableElements.createButton}")`);
    this.saveButton = this.page.locator(`button:has-text("${constants.tableElements.saveButton}")`);
    this.tasksLink = this.page.locator(`a:has-text("${constants.mainPageElements.tasksMenuItemLabel}")`);
  }

  async goto() {
    await this.click(this.tasksLink);
    await this.page.waitForURL('**/tasks');
  }

  async createTask(title, description = 'Test description') {
    await this.click(this.createButton);
    await this.page.waitForSelector('input[name="title"]', { state: 'visible' });
    await this.page.fill('input[name="title"]', title);
    await this.page.fill('textarea[name="content"]', description);
    
    const statusSelect = this.page.locator('select[name="status"]');
    await statusSelect.selectOption({ index: 1 });
    await this.click(this.saveButton);
    await this.page.waitForTimeout(3000);
  }
}

export default TasksPage;