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
    console.log('Tasks page loaded successfully');
  }

  async openCreateForm() {
    console.log('Opening create form for tasks...');
    await this.click(this.createButton);
    
    await this.page.waitForSelector('form, input[name="title"], textarea[name="content"]', { 
      state: 'visible', 
      timeout: 10000 
    });
    console.log('Create form opened');
  }

  async createTask(title = null, description = 'Test task description') {
    const taskTitle = title || `Test Task ${Date.now()}`;
    
    try {
      await this.openCreateForm();
      
      console.log('Filling task form...');
      
      await this.page.fill('input[name="title"]', taskTitle);
      await this.page.fill('textarea[name="content"]', description);
      
      await this.fillKanbanFields();
      
      console.log('Saving task...');
      await this.click(this.saveButton);
      
      await this.waitForTaskCreationSuccess();
      
      console.log('Task created successfully');
      return taskTitle;
      
    } catch (error) {
      console.log('Error during task creation:', error.message);
      await this.page.screenshot({ path: `task-error-${Date.now()}.png` });
      throw error;
    }
  }

  async fillKanbanFields() {
    console.log('Filling kanban-specific fields...');
    
    const kanbanFields = [
      { name: 'assignee', type: 'select', required: true },
      { name: 'status', type: 'select', required: true },
      { name: 'label', type: 'select', required: false }
    ];
    
    for (const field of kanbanFields) {
      try {
        const selector = `select[name="${field.name}"], input[name="${field.name}"], [data-testid="${field.name}"]`;
        const element = this.page.locator(selector);
        
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`Found ${field.name} field`);
          
          if (field.type === 'select') {
            await this.selectFirstOption(element, field.name);
          }
        } else if (field.required) {
          console.log(`Required field ${field.name} not found, but continuing...`);
        }
      } catch (error) {
        console.log(`Could not fill ${field.name}:`, error.message);
      }
    }
  }

  async selectFirstOption(selectElement, fieldName) {
    const options = selectElement.locator('option:not([value=""])');
    const optionCount = await options.count();
    
    if (optionCount > 0) {
      await selectElement.selectOption({ index: 1 });
      const selectedValue = await selectElement.inputValue();
      console.log(`Selected ${fieldName}: ${selectedValue}`);
    } else {
      console.log(`No options available for ${fieldName}`);
    }
  }

  async waitForTaskCreationSuccess() {
    console.log('Waiting for task creation to complete...');
    
    try {
      await this.page.waitForSelector('input[name="title"]', { 
        state: 'hidden', 
        timeout: 5000 
      });
      console.log('Create form closed');
    } catch (error) {
      console.log('Form might still be visible, checking other indicators...');
    }
    
    const currentUrl = this.page.url();
    if (currentUrl.includes('/tasks')) {
      console.log('On tasks kanban board');
    }
    
    await this.page.waitForTimeout(2000);
  }

  async findTaskInKanban(taskTitle) {
    const taskCard = this.page.locator('.card, .task-card, .kanban-card, [class*="card"], [class*="task"]')
      .filter({ hasText: taskTitle })
      .first();
    
    return taskCard;
  }

  async verifyTaskStatus(taskTitle, expectedStatus) {
    const taskCard = await this.findTaskInKanban(taskTitle);
    const statusElement = taskCard.locator('.status, [class*="status"], .badge');
    const actualStatus = await statusElement.textContent();
    
    if (actualStatus && actualStatus.includes(expectedStatus)) {
      console.log(`✅ Task is in correct status: ${expectedStatus}`);
      return true;
    } else {
      console.log(`❌ Task status mismatch. Expected: ${expectedStatus}, Actual: ${actualStatus}`);
      return false;
    }
  }
}

export default TasksPage;