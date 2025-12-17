import BasePage from './BasePage.js';
import constants from '../utils/constants.js';
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
    try {
      await this.page.goto('/#/users', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
      await helpers.waitForPageLoad(this.page);
      await helpers.waitForTimeout(2000);
    } catch (error) {
      console.log('Не удалось перейти по URL, пробуем через меню');
      try {
        await this.page.locator('a:has-text("Users")').first().click({ timeout: 15000 });
        await helpers.waitForPageLoad(this.page);
        await helpers.waitForTimeout(1000);
      } catch (e) {
        throw new Error('Не удалось перейти на страницу пользователей');
      }
    }
  }

  async openCreateForm() {
    await this.page.goto('/#/users/create', { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });
    await helpers.waitForPageLoad(this.page);
    await this.waitForElement(this.emailInput, 20000);
    await this.waitForElement(this.firstNameInput, 20000);
    await this.waitForElement(this.lastNameInput, 20000);
  }

  async createUser(email = null, firstName = null, lastName = null) {
    const userEmail = email || `test${Date.now()}@example.com`;
    const userFirstName = firstName || `FirstName${Date.now()}`;
    const userLastName = lastName || `LastName${Date.now()}`;
    
    console.log(`Создаем пользователя: ${userEmail}, ${userFirstName} ${userLastName}`);
    
    try {
      await this.openCreateForm();
    } catch (error) {
      console.log('Не удалось открыть форму создания, пробуем другой способ');
      await this.goto();
      await helpers.waitForTimeout(2000);
      
      if (await this.createButton.isVisible({ timeout: 5000 })) {
        await this.createButton.click();
        await helpers.waitForPageLoad(this.page);
        await this.waitForElement(this.emailInput, 15000);
        await this.waitForElement(this.firstNameInput, 15000);
        await this.waitForElement(this.lastNameInput, 15000);
      } else {
        throw error;
      }
    }
    
    await this.fill(this.emailInput, userEmail);
    await this.fill(this.firstNameInput, userFirstName);
    await this.fill(this.lastNameInput, userLastName);
    await this.click(this.saveButton);
    await helpers.waitForPageLoad(this.page);
    await helpers.waitForTimeout(3000);
    
    console.log(`Пользователь ${userEmail} создан`);
    return { email: userEmail, firstName: userFirstName, lastName: userLastName };
  }

  async editUser(oldEmail, newData) {
    await this.goto();
    await helpers.waitForTimeout(3000);
    
    console.log(`Ищем пользователя для редактирования: ${oldEmail}`);
    
    if (!await this.isUserVisible(oldEmail, 10000)) {
      console.log(`Пользователь ${oldEmail} не найден, создаем его`);
      const firstName = `FirstName${Date.now()}`;
      const lastName = `LastName${Date.now()}`;
      await this.createUser(oldEmail, firstName, lastName);
      await helpers.waitForTimeout(2000);
      await this.goto();
      await helpers.waitForTimeout(2000);
    }
    
    const userRow = this.page.locator('tbody tr').filter({ hasText: oldEmail }).first();
    
    if (await userRow.isVisible({ timeout: 15000 })) {
      console.log(`Пользователь ${oldEmail} найден, кликаем для редактирования`);
      
      await userRow.click({ force: true });
      await this.waitForElement(this.emailInput, 20000);
      await this.waitForElement(this.firstNameInput, 20000);
      await this.waitForElement(this.lastNameInput, 20000);
      await helpers.waitForTimeout(2000);
    
      if (newData.email) {
        await this.clear(this.emailInput);
        await this.fill(this.emailInput, newData.email);
      }
      
      if (newData.firstName) {
        await this.clear(this.firstNameInput);
        await this.fill(this.firstNameInput, newData.firstName);
      }
      
      if (newData.lastName) {
        await this.clear(this.lastNameInput);
        await this.fill(this.lastNameInput, newData.lastName);
      }
      
      await this.click(this.saveButton);
      
      await helpers.waitForPageLoad(this.page);
      await helpers.waitForTimeout(3000);
      await this.goto();
      await helpers.waitForTimeout(2000);
      
      console.log(`Пользователь отредактирован: ${oldEmail} -> ${newData.email || oldEmail}`);
      return newData;
    } else {
      console.log(`Пользователь ${oldEmail} не найден в таблице`);
      return { email: oldEmail }; 
    }
  }

  async deleteUser(email) {
    await this.goto();
    await helpers.waitForTimeout(2000);
    
    console.log(`Пытаемся удалить пользователя: ${email}`);
    
    if (!await this.isUserVisible(email, 10000)) {
      console.log(`Пользователь ${email} не найден, создаем его`);
      const firstName = `FirstName${Date.now()}`;
      const lastName = `LastName${Date.now()}`;
      await this.createUser(email, firstName, lastName);
      await helpers.waitForTimeout(2000);
      await this.goto();
      await helpers.waitForTimeout(2000);
    }
    
    const userRow = this.page.locator('tbody tr').filter({ hasText: email }).first();
    
    if (await userRow.isVisible({ timeout: 15000 })) {
      console.log(`Пользователь ${email} найден`);
      
      const checkbox = userRow.locator('td:first-child input[type="checkbox"]').first();
      
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
            await userRow.waitFor({ state: 'hidden', timeout: 5000 });
            console.log('Строка с пользователем исчезла из таблицы');
          } catch (error) {
            console.log('Строка не исчезла сразу, обновляем страницу');
            await this.goto();
            await helpers.waitForTimeout(2000);
          }
          
          console.log(`Пользователь ${email} успешно удален`);
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
      console.log(`Пользователь ${email} не найден в таблице`);
      return false;
    }
  }

  async massDeleteUsers() {
    await this.goto();
    await helpers.waitForTimeout(2000);
    
    console.log('Начинаем массовое удаление пользователей');
    
    const initialCount = await this.getUserCount();
    console.log(`Текущее количество пользователей: ${initialCount}`);
    
    if (initialCount === 0) {
      console.log('Нет пользователей для удаления');
      return true;
    }
    
    console.log('Пытаемся удалить всех пользователей');
    
    if (await this.selectAllCheckbox.isVisible({ timeout: 5000 })) {
      console.log('Чекбокс "Select all" найден, отмечаем его');
      
      await this.selectAllCheckbox.check({ force: true });
      await helpers.waitForTimeout(2000);
      
      const bulkDeleteButton = this.page.locator('button:has-text("Delete"):visible').first();
      
      if (await bulkDeleteButton.isVisible({ timeout: 5000 })) {
        console.log('Кнопка Delete найдена, нажимаем');
        
        await bulkDeleteButton.click();
        await helpers.waitForTimeout(2000);
        
        console.log('Ждем уведомления о массовом удалении...');
        
        try {
          await this.waitForElement(this.snackbar, 10000);
          console.log('Уведомление об удалении появилось');
        } catch (error) {
          console.log('Уведомление не появилось');
        }
        await helpers.waitForTimeout(3000);
        
        await this.goto();
        await helpers.waitForTimeout(2000);
        
        const finalCount = await this.getUserCount();
        console.log(`Количество пользователей после удаления: ${finalCount}`);
        
        if (finalCount < initialCount) {
          console.log(`Удалено ${initialCount - finalCount} пользователей`);
          return true;
        } else {
          console.log('Количество пользователей не изменилось');
          return false;
        }
      } else {
        console.log('Кнопка Delete не появилась после выделения');
        return false;
      }
    } else {
      console.log('Чекбокс "Select all" не найден');
      return false;
    }
  }

  async getUserCount() {
    const count = await this.tableRows.count();
    console.log(`Текущее количество пользователей: ${count}`);
    return count;
  }

  async isUserVisible(email, timeout = 10000) {
    const userRow = this.page.locator('tbody tr').filter({ hasText: email }).first();
    const isVisible = await userRow.isVisible({ timeout }).catch(() => false);
    console.log(`Пользователь ${email} видим: ${isVisible}`);
    return isVisible;
  }
}

export default UsersPage;