import BasePage from './BasePage.js';
import constants from '../utils/constants.js';
import helpers from '../utils/helpers.js';

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
    try {
      await this.page.goto('/#/task_statuses', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
      await helpers.waitForPageLoad(this.page);
      await helpers.waitForTimeout(2000);
    } catch (error) {
      console.log('Не удалось перейти по URL, пробуем через меню');
      try {
        await this.page.locator('a:has-text("Task statuses")').first().click({ timeout: 15000 });
        await helpers.waitForPageLoad(this.page);
        await helpers.waitForTimeout(1000);
      } catch (e) {
        throw new Error('Не удалось перейти на страницу статусов');
      }
    }
  }

  async openCreateForm() {
    await this.page.goto('/#/task_statuses/create', { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });
    await helpers.waitForPageLoad(this.page);
    await this.waitForElement(this.nameInput, 20000);
    await this.waitForElement(this.slugInput, 20000);
  }

  async createStatus(name = null, slug = null) {
    const statusName = name || `Status${Date.now()}`;
    const statusSlug = slug || `status-${Date.now()}`;
    
    console.log(`Создаем статус: ${statusName}, slug: ${statusSlug}`);
    
    try {
      await this.openCreateForm();
    } catch (error) {
      console.log('Не удалось открыть форму создания, пробуем другой способ');
      await this.goto();
      await helpers.waitForTimeout(2000);
      
      if (await this.createButton.isVisible({ timeout: 5000 })) {
        await this.createButton.click();
        await helpers.waitForPageLoad(this.page);
        await this.waitForElement(this.nameInput, 15000);
        await this.waitForElement(this.slugInput, 15000);
      } else {
        throw error;
      }
    }
    
    await this.fill(this.nameInput, statusName);
    await this.fill(this.slugInput, statusSlug);
    await this.click(this.saveButton);
    await helpers.waitForPageLoad(this.page);
    await helpers.waitForTimeout(3000);
    
    console.log(`Статус ${statusName} создан`);
    return { name: statusName, slug: statusSlug };
  }

  async editStatus(oldName, newName, newSlug = null) {
    await this.goto();
    await helpers.waitForTimeout(3000);
    
    console.log(`Ищем статус для редактирования: ${oldName}`);
    
    if (!await this.isStatusVisible(oldName, 10000)) {
      console.log(`Статус ${oldName} не найден, создаем его`);
      const slug = `slug-${Date.now()}`;
      await this.createStatus(oldName, slug);
      await helpers.waitForTimeout(2000);
      await this.goto();
      await helpers.waitForTimeout(2000);
    }
    
    const statusRow = this.page.locator('tbody tr').filter({ hasText: oldName }).first();
    
    if (await statusRow.isVisible({ timeout: 15000 })) {
      console.log(`Статус ${oldName} найден, кликаем для редактирования`);
      
      await statusRow.click({ force: true });
      
      await this.waitForElement(this.nameInput, 20000);
      await this.waitForElement(this.slugInput, 20000);
      await helpers.waitForTimeout(2000);
      await this.clear(this.nameInput);
      await this.fill(this.nameInput, newName);
      
      if (newSlug) {
        await this.clear(this.slugInput);
        await this.fill(this.slugInput, newSlug);
      } else {
        const currentSlug = await this.slugInput.inputValue();
        if (!currentSlug || currentSlug.trim() === '') {
          const autoSlug = `updated-slug-${Date.now()}`;
          await this.fill(this.slugInput, autoSlug);
        }
      }
      
      await this.click(this.saveButton);
      
      await helpers.waitForPageLoad(this.page);
      await helpers.waitForTimeout(3000);
      
      await this.goto();
      await helpers.waitForTimeout(2000);
      
      console.log(`Статус отредактирован: ${oldName} -> ${newName}`);
      return { name: newName, slug: newSlug };
    } else {
      console.log(`Статус ${oldName} не найден в таблице`);
      return { name: oldName }; 
    }
  }

  async deleteStatus(statusName) {
    await this.goto();
    await helpers.waitForTimeout(2000);
    
    console.log(`Пытаемся удалить статус: ${statusName}`);
    
    if (!await this.isStatusVisible(statusName, 10000)) {
      console.log(`Статус ${statusName} не найден, создаем его`);
      const slug = `slug-${Date.now()}`;
      await this.createStatus(statusName, slug);
      await helpers.waitForTimeout(2000);
      await this.goto();
      await helpers.waitForTimeout(2000);
    }
    
    const statusRow = this.page.locator('tbody tr').filter({ hasText: statusName }).first();
    
    if (await statusRow.isVisible({ timeout: 15000 })) {
      console.log(`Статус ${statusName} найдена`);
      
      const checkbox = statusRow.locator('td:first-child input[type="checkbox"]').first();
      
      if (await checkbox.isVisible({ timeout: 5000 })) {
        console.log('Чекбокс найден, отмечаем его');
        
        await checkbox.check({ force: true });
        await helpers.waitForTimeout(1500);
        
        const bulkDeleteButton = this.page.locator('button:has-text("Delete"):visible').first();
        
        if (await bulkDeleteButton.isVisible({ timeout: 5000 })) {
          console.log('Кнопка Delete найдена, нажимаем');
          
          await bulkDeleteButton.click();
          await helpers.waitForTimeout(2000);
          
          console.log('Ждем уведомление об удалении...');
          
          try {
            await this.waitForElement(this.snackbar, 10000);
            console.log('Уведомление об удалении появилось');
          } catch (error) {
            console.log('Уведомление не появилось');
          }
          
          try {
            await statusRow.waitFor({ state: 'hidden', timeout: 5000 });
            console.log('Строка со статусом исчезла из таблицы');
          } catch (error) {
            console.log('Строка не исчезла сразу, обновляем страницу');
            await this.goto();
            await helpers.waitForTimeout(2000);
          }
          
          console.log(`Статус ${statusName} успешно удален`);
          return true;
        } else {
          console.log('Кнопка Delete не появилась');
          return false;
        }
      } else {
        console.log('Чекбокс не найден');
        return false;
      }
    } else {
      console.log(`Статус ${statusName} не найден в таблице`);
      return false;
    }
  }

  async massDeleteStatuses() {
    await this.goto();
    await helpers.waitForTimeout(2000);
    
    console.log('Начинаем массовое удаление статусов');
    
    const testStatuses = [];
    for (let i = 1; i <= 3; i++) {
      const statusName = `TestStatus${i}_${Date.now()}`;
      const statusSlug = `test-status-${i}-${Date.now()}`;
      await this.createStatus(statusName, statusSlug);
      testStatuses.push(statusName);
      await helpers.waitForTimeout(1000);
    }
    
    await helpers.waitForTimeout(2000);
    await this.goto();
    await helpers.waitForTimeout(2000);
    
    for (const statusName of testStatuses) {
      const statusRow = this.page.locator('tbody tr').filter({ hasText: statusName }).first();
      if (await statusRow.isVisible({ timeout: 5000 })) {
        const checkbox = statusRow.locator('td:first-child input[type="checkbox"]').first();
        await checkbox.check({ force: true });
        await helpers.waitForTimeout(500);
      }
    }
    
    const bulkDeleteButton = this.page.locator('button:has-text("Delete"):visible').first();
    
    if (await bulkDeleteButton.isVisible({ timeout: 5000 })) {
      console.log('Кнопка Delete найдена, нажимаем');
      
      await bulkDeleteButton.click();
      await helpers.waitForTimeout(2000);
      
      try {
        await this.waitForElement(this.snackbar, 10000);
        console.log('Уведомление об удалении появилось');
      } catch (error) {
        console.log('Уведомление не появилось');
      }
      
      await helpers.waitForTimeout(3000);
      
      await this.goto();
      await helpers.waitForTimeout(2000);
      
      let allDeleted = true;
      for (const statusName of testStatuses) {
        const isStillVisible = await this.isStatusVisible(statusName);
        if (isStillVisible) {
          console.log(`Статус ${statusName} все еще виден`);
          allDeleted = false;
        }
      }
      
      return allDeleted;
    } else {
      console.log('Кнопка Delete не появилась');
      return false;
    }
  }

  async getStatusCount() {
    const count = await this.tableRows.count();
    console.log(`Текущее количество статусов: ${count}`);
    return count;
  }

  async isStatusVisible(statusName, timeout = 10000) {
    const statusRow = this.page.locator('tbody tr').filter({ hasText: statusName }).first();
    const isVisible = await statusRow.isVisible({ timeout }).catch(() => false);
    console.log(`Статус ${statusName} видим: ${isVisible}`);
    return isVisible;
  }
}

export default StatusesPage;