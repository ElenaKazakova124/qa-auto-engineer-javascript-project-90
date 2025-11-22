import BasePage from './BasePage.js';
import constants from '../utils/constants.js';

class TasksPage extends BasePage {
  constructor(page) {
    super(page);
    this.createButton = this.page.locator(`a:has-text("${constants.tableElements.createButton}")`);
    this.saveButton = this.page.locator(`button[aria-label="Save"]`);
    this.tasksLink = this.page.locator(`a:has-text("${constants.mainPageElements.tasksMenuItemLabel}")`);
    
    // Селекторы для формы создания задачи (не фильтров!)
    this.assigneeSelection = this.page.getByRole('combobox', { name: 'Assignee' });
    this.titleInput = this.page.getByLabel('Title');
    this.contentInput = this.page.locator('textarea[name="content"]');
    this.statusSelection = this.page.getByRole('combobox', { name: 'Status' });
    this.labelSelection = this.page.getByRole('combobox', { name: 'Label' });
    
    this.successMessage = this.page.locator('.alert-success, .text-success, [class*="success"]');
    this.errorMessage = this.page.locator('.error, .text-danger, .invalid-feedback, [class*="error"]');
  }

  async goto() {
    try {
      console.log('Navigating to tasks page...');
      await this.tasksLink.click();
      await this.page.waitForURL('**/#/tasks', { timeout: 10000 });
      console.log('Successfully navigated to tasks page');
    } catch (error) {
      console.log('Navigation failed, trying direct URL...');
      await this.page.goto('http://localhost:5173/#/tasks');
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  async waitForFormReady() {
    console.log('Waiting for task creation form to be ready...');
    
    // Ждем появления формы создания задачи
    await this.page.waitForSelector('.RaCreate-card', { timeout: 15000 });
    
    // Проверяем основные элементы формы
    console.log('=== FORM ELEMENTS CHECK ===');
    console.log('Assignee selection visible:', await this.assigneeSelection.isVisible());
    console.log('Title input visible:', await this.titleInput.isVisible());
    console.log('Content textarea visible:', await this.contentInput.isVisible());
    console.log('Status selection visible:', await this.statusSelection.isVisible());
    console.log('Label selection visible:', await this.labelSelection.isVisible());
    console.log('Save button visible:', await this.saveButton.isVisible());
    
    // Убеждаемся что все обязательные поля видны
    await this.assigneeSelection.waitFor({ state: 'visible', timeout: 5000 });
    await this.titleInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.statusSelection.waitFor({ state: 'visible', timeout: 5000 });
  }

  async chooseItem(dropdownLocator, optionIndex = 0) {
    console.log(`Opening dropdown and selecting option ${optionIndex}...`);
    
    // Кликаем на dropdown
    await dropdownLocator.click();
    
    // Ждем появления списка опций
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    
    // Выбираем опцию по индексу
    const options = await this.page.locator('[role="listbox"] [role="option"]').all();
    console.log(`Found ${options.length} options`);
    
    if (options.length > optionIndex) {
      await options[optionIndex].click();
      console.log(`Selected option at index ${optionIndex}`);
    } else if (options.length > 0) {
      await options[0].click();
      console.log('Selected first available option');
    } else {
      throw new Error('No options available in dropdown');
    }
  }

  async createTask(title, description = 'Test description') {
    try {
      console.log('=== STARTING TASK CREATION ===');
      
      // Переходим на страницу создания задачи
      await this.createButton.click();
      console.log('Clicked create button');
      
      // Ждем загрузки формы создания
      await this.waitForFormReady();
      
      // Заполняем обязательные поля
      console.log('Filling form fields...');
      
      // Выбираем assignee (обязательное поле)
      await this.chooseItem(this.assigneeSelection, 0);
      
      // Заполняем title (обязательное поле)
      await this.titleInput.fill(title);
      console.log('Title filled:', title);
      
      // Заполняем content (необязательное поле)
      await this.contentInput.fill(description);
      console.log('Description filled');
      
      // Выбираем status (обязательное поле)
      await this.chooseItem(this.statusSelection, 0);
      
      // Выбираем label (необязательное поле)
      if (await this.labelSelection.isVisible({ timeout: 2000 })) {
        await this.chooseItem(this.labelSelection, 0);
      }
      
      // Проверяем что кнопка Save активна
      const isSaveDisabled = await this.saveButton.getAttribute('disabled');
      console.log('Save button disabled:', !!isSaveDisabled);
      
      if (isSaveDisabled) {
        throw new Error('Save button is still disabled after filling required fields');
      }
      
      // Сохраняем задачу
      await this.saveButton.click();
      console.log('Save button clicked');
      
      // Ждем успешного создания
      await this.page.waitForURL('**/#/tasks', { timeout: 10000 });
      console.log('Successfully redirected to tasks list');
      
      console.log('=== TASK CREATION COMPLETED SUCCESSFULLY ===');
      
    } catch (error) {
      console.error('=== TASK CREATION FAILED ===');
      console.error('Error:', error.message);
      
      // Диагностика
      console.log('Current URL:', this.page.url());
      
      // Скриншот для отладки
      await this.page.screenshot({ 
        path: `task-creation-error-${Date.now()}.png`,
        fullPage: true 
      });
      
      throw error;
    }
  }

  async verifyTaskExists(title) {
    try {
      const taskLocator = this.page.locator(`text=${title}`).first();
      return await taskLocator.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }
}

export default TasksPage;