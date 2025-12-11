import BasePage from './BasePage.js';
import helpers from '../utils/helpers.js';

class TasksPage extends BasePage {
  constructor(page) {
    super(page);
    
    this.createButton = this.page.locator('a:has-text("Create"), button:has-text("Create")').first();
    this.taskNameInput = this.page.locator('input[name="title"], input[name="name"]').first();
    this.taskContentInput = this.page.locator('textarea[name="content"], textarea[name="description"]').first();
    this.assigneeSelect = this.page.locator('select[name="assignee"], [aria-label*="assignee"]').first();
    this.statusSelect = this.page.locator('select[name="status"], [aria-label*="status"]').first();
    this.labelSelect = this.page.locator('select[name="label"], [aria-label*="label"]').first();
    this.saveButton = this.page.locator('button:has-text("SAVE"), button:has-text("Save")').first();
    this.searchInput = this.page.locator('input[placeholder*="Search"]').first();
    
    this.kanbanColumns = this.page.locator('.kanban-column, .board-column, .column, [class*="column"]');
    this.taskCards = this.page.locator('.task-card, .card, [class*="task"]');
  }

  async goto() {
    await this.page.goto('http://localhost:5173/#/tasks');
    await helpers.waitForPageLoad(this.page);
  }

  async createTask(name, description, assignee = null, status = null, label = null) {
    
    await this.page.goto('http://localhost:5173/#/tasks/create');
    await helpers.waitForPageLoad(this.page);
    
    await this.waitForElement(this.taskNameInput, 10000);
    await this.fill(this.taskNameInput, name);
    
    if (description && await this.taskContentInput.isVisible({ timeout: 5000 })) {
      await this.fill(this.taskContentInput, description);
    }
    
    if (assignee) {
      await this.selectCustomDropdown(this.assigneeSelect, assignee);
    }
    
    if (status) {
      await this.selectCustomDropdown(this.statusSelect, status);
    }
    
    if (label) {
      await this.selectCustomDropdown(this.labelSelect, label);
    }
    
    await this.click(this.saveButton);
    await helpers.waitForPageLoad(this.page);
  }

  async selectCustomDropdown(dropdownLocator, optionText) {
    if (await dropdownLocator.isVisible({ timeout: 3000 })) {
      const isSelect = await dropdownLocator.evaluate(el => el.tagName === 'SELECT');
      
      if (isSelect) {
        await dropdownLocator.selectOption({ label: optionText });
      } else {
        await dropdownLocator.click();
        await helpers.waitForTimeout(1000);
        const option = this.page.locator(`[role="option"]:has-text("${optionText}"), option:has-text("${optionText}")`).first();
        if (await option.isVisible({ timeout: 2000 })) {
          await option.click();
        }
      }
    }
  }

  async getTaskCount() {
    return await this.taskCards.count();
  }

  async getColumnCount() {
    return await this.kanbanColumns.count();
  }

  async moveTaskToColumn(taskName, columnIndex) {
    const taskCard = this.page.locator(`.task-card:has-text("${taskName}")`).first();
    const targetColumn = this.kanbanColumns.nth(columnIndex);
    
    if (await taskCard.isVisible() && await targetColumn.isVisible()) {
      await taskCard.dragTo(targetColumn);
      await helpers.waitForTimeout(2000);
      return true;
    }
    return false;
  }

  async searchTask(searchText) {
    if (await this.searchInput.isVisible({ timeout: 5000 })) {
      await this.fill(this.searchInput, searchText);
      await helpers.waitForTimeout(1000);
    }
  }

  async openTaskDetails(taskName) {
    const taskCard = this.page.locator(`.task-card:has-text("${taskName}")`).first();
    if (await taskCard.isVisible({ timeout: 5000 })) {
      await taskCard.click();
      await helpers.waitForPageLoad(this.page);
      return true;
    }
    return false;
  }
}

export default TasksPage;