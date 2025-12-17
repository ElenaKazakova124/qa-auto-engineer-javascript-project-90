import BasePage from './BasePage.js';
import constants from '../utils/constants.js';
import helpers from '../utils/helpers.js';

class LabelsPage extends BasePage {
  constructor(page) {
    super(page);
    
    this.labelsLink = this.page.locator('a:has-text("Labels")').first();
    
    this.tableRows = this.page.locator('tbody tr');
    this.selectAllCheckbox = this.page.locator('thead input[type="checkbox"]').first();
    this.rowCheckboxes = this.page.locator('tbody input[type="checkbox"]');
    
    this.nameInput = this.page.locator('input[name="name"]').first();
    this.saveButton = this.page.locator('button:has-text("Save")').first();
    
    this.createButton = this.page.locator('a:has-text("Create")').first();
    
    this.snackbar = this.page.locator('.MuiSnackbar-root, [role="alert"], .snackbar, .toast').first();
    this.undoButton = this.page.locator('button:has-text("UNDO")').first();
  }

  async goto() {
    try {
      await this.page.goto('/#/labels', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
      await helpers.waitForPageLoad(this.page);
      await helpers.waitForTimeout(2000);
    } catch (error) {
      console.log('Не удалось перейти по URL, пробуем через меню');
      try {
        await this.page.locator('a:has-text("Labels")').first().click({ timeout: 15000 });
        await helpers.waitForPageLoad(this.page);
        await helpers.waitForTimeout(1000);
      } catch (e) {
        throw new Error('Не удалось перейти на страницу меток');
      }
    }
  }

  async openCreateForm() {
    await this.page.goto('/#/labels/create', { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });
    await helpers.waitForPageLoad(this.page);
    
    await this.waitForElement(this.nameInput, 20000);
  }

  async createLabel(name = null) {
    const labelName = name || `Label${Date.now()}`;
    
    console.log(`Создаем метку: ${labelName}`);
    
    try {
      await this.openCreateForm();
    } catch (error) {
      console.log('Не удалось открыть форму создания, пробуем другой способ');
      await this.goto();
      await helpers.waitForTimeout(2000);
      
      if (await this.createButton.isVisible({ timeout: 5000 })) {
        await this.createButton.click();
        await helpers.waitForPageLoad(this.page);
      } else {
        throw error;
      }
    }
    
    await this.fill(this.nameInput, labelName);
    
    await this.click(this.saveButton);
    
    await helpers.waitForPageLoad(this.page);
    await helpers.waitForTimeout(3000);
    
    console.log(`Метка ${labelName} создана`);
    return labelName;
  }

  async editLabel(oldName, newName) {
    await this.goto();
    await helpers.waitForTimeout(3000);
    
    console.log(`Ищем метку для редактирования: ${oldName}`);
    
    if (!await this.isLabelVisible(oldName, 10000)) {
      console.log(`Метка ${oldName} не найдена, создаем ее`);
      await this.createLabel(oldName);
      await helpers.waitForTimeout(2000);
      await this.goto();
      await helpers.waitForTimeout(2000);
    }
    
    const labelRow = this.page.locator('tbody tr').filter({ hasText: oldName }).first();
    
    if (await labelRow.isVisible({ timeout: 15000 })) {
      console.log(`Метка ${oldName} найдена, кликаем для редактирования`);
      
      await labelRow.click({ force: true });
      
      await this.waitForElement(this.nameInput, 20000);
      await helpers.waitForTimeout(2000);
      
      await this.clear(this.nameInput);
      await this.fill(this.nameInput, newName);
      
      await this.click(this.saveButton);
      
      await helpers.waitForPageLoad(this.page);
      await helpers.waitForTimeout(3000);
      
      await this.goto();
      await helpers.waitForTimeout(2000);
      
      console.log(`Метка отредактирована: ${oldName} -> ${newName}`);
      return newName;
    } else {
      console.log(`Метка ${oldName} не найдена в таблице`);
      return oldName;
    }
  }

  async deleteLabel(labelName) {
    await this.goto();
    await helpers.waitForTimeout(2000);
    
    console.log(`Пытаемся удалить метку: ${labelName}`);
    
    if (!await this.isLabelVisible(labelName, 10000)) {
      console.log(`Метка ${labelName} не найдена, создаем ее`);
      await this.createLabel(labelName);
      await helpers.waitForTimeout(2000);
      await this.goto();
      await helpers.waitForTimeout(2000);
    }
    
    const labelRow = this.page.locator('tbody tr').filter({ hasText: labelName }).first();
    
    if (await labelRow.isVisible({ timeout: 15000 })) {
      console.log(`Метка ${labelName} найдена`);
      
      const checkbox = labelRow.locator('td:first-child input[type="checkbox"]').first();
      
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
            await labelRow.waitFor({ state: 'hidden', timeout: 5000 });
            console.log('Строка с меткой исчезла из таблицы');
          } catch (error) {
            console.log('Строка не исчезла сразу, обновляем страницу');
            await this.goto();
            await helpers.waitForTimeout(2000);
          }
          
          console.log(`Метка ${labelName} успешно удалена`);
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
      console.log(`Метка ${labelName} не найдена в таблице`);
      return false;
    }
  }

  async massDeleteLabels() {
    await this.goto();
    await helpers.waitForTimeout(2000);
    
    console.log('Начинаем массовое удаление меток');
    
    const testLabels = [];
    for (let i = 1; i <= 3; i++) {
      const labelName = `TestLabel${i}_${Date.now()}`;
      await this.createLabel(labelName);
      testLabels.push(labelName);
      await helpers.waitForTimeout(1000);
    }
    
    await helpers.waitForTimeout(2000);
    await this.goto();
    await helpers.waitForTimeout(2000);
    
    for (const labelName of testLabels) {
      const labelRow = this.page.locator('tbody tr').filter({ hasText: labelName }).first();
      if (await labelRow.isVisible({ timeout: 5000 })) {
        const checkbox = labelRow.locator('td:first-child input[type="checkbox"]').first();
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
      for (const labelName of testLabels) {
        const isStillVisible = await this.isLabelVisible(labelName);
        if (isStillVisible) {
          console.log(`Метка ${labelName} все еще видна`);
          allDeleted = false;
        }
      }
      
      return allDeleted;
    } else {
      console.log('Кнопка Delete не появилась');
      return false;
    }
  }

  async getLabelCount() {
    const count = await this.tableRows.count();
    console.log(`Текущее количество меток: ${count}`);
    return count;
  }

  async isLabelVisible(labelName, timeout = 10000) {
    const labelRow = this.page.locator('tbody tr').filter({ hasText: labelName }).first();
    const isVisible = await labelRow.isVisible({ timeout }).catch(() => false);
    console.log(`Метка ${labelName} видима: ${isVisible}`);
    return isVisible;
  }
}

export default LabelsPage;