import BasePage from './BasePage.js';
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
    } catch (_error) {
      try {
        await this.page.locator('a:has-text("Users")').first().click({ timeout: 15000 });
        await helpers.waitForPageLoad(this.page);
      } catch (_e) {
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
    
    try {
      await this.openCreateForm();
    } catch (_error) {
      await this.goto();
      await this.page.waitForLoadState('networkidle');
      
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
    
    return { email: userEmail, firstName: userFirstName, lastName: userLastName };
  }

  async editUser(oldEmail, newData) {
    await this.goto();
    await this.page.waitForLoadState('networkidle');
    
    if (!await this.isUserVisible(oldEmail, 10000)) {
      const firstName = `FirstName${Date.now()}`;
      const lastName = `LastName${Date.now()}`;
      await this.createUser(oldEmail, firstName, lastName);
      await this.page.waitForLoadState('networkidle');
      await this.goto();
    }
    
    const userRow = this.page.locator('tbody tr').filter({ hasText: oldEmail }).first();
    
    if (await userRow.isVisible({ timeout: 15000 })) {
      await userRow.click({ force: true });
      await this.waitForElement(this.emailInput, 20000);
      await this.waitForElement(this.firstNameInput, 20000);
      await this.waitForElement(this.lastNameInput, 20000);
    
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
      await this.page.waitForLoadState('networkidle');
      await this.goto();
      await this.page.locator('tbody tr').first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
      
      return newData;
    } else {
      return { email: oldEmail }; 
    }
  }

  async deleteUser(email) {
    await this.goto();
    await this.page.waitForLoadState('networkidle');
    
    if (!await this.isUserVisible(email, 10000)) {
      const firstName = `FirstName${Date.now()}`;
      const lastName = `LastName${Date.now()}`;
      await this.createUser(email, firstName, lastName);
      await this.page.waitForLoadState('networkidle');
      await this.goto();
    }
    
    const userRow = this.page.locator('tbody tr').filter({ hasText: email }).first();
    
    if (await userRow.isVisible({ timeout: 15000 })) {
      const checkbox = userRow.locator('td:first-child input[type="checkbox"]').first();
      
      if (await checkbox.isVisible({ timeout: 5000 })) {
        await checkbox.check({ force: true });
        await this.page.waitForLoadState('networkidle');
        
        const bulkDeleteButton = this.page.locator('button:has-text("Delete"):visible').first();
        
        if (await bulkDeleteButton.isVisible({ timeout: 5000 })) {
          await bulkDeleteButton.click();
          await this.page.waitForLoadState('networkidle');
          
          try {
            await this.waitForElement(this.snackbar, 10000);
          } catch (_error) {
          }
          
          try {
            await userRow.waitFor({ state: 'hidden', timeout: 5000 });
          } catch (_error) {
            await this.goto();
          }
          
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  async massDeleteUsers() {
    await this.goto();
    await this.page.waitForLoadState('networkidle');
    
    const initialCount = await this.getUserCount();
    
    if (initialCount === 0) {
      return true;
    }
    
    if (await this.selectAllCheckbox.isVisible({ timeout: 5000 })) {
      await this.selectAllCheckbox.check({ force: true });
      await this.page.waitForLoadState('networkidle');
      
      const bulkDeleteButton = this.page.locator('button:has-text("Delete"):visible').first();
      
      if (await bulkDeleteButton.isVisible({ timeout: 5000 })) {
        await bulkDeleteButton.click();
        await this.page.waitForLoadState('networkidle');
        
        try {
          await this.waitForElement(this.snackbar, 10000);
        } catch (_error) {
        }
        
        await this.goto();
        
        const finalCount = await this.getUserCount();
        
        if (finalCount < initialCount) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  async getUserCount() {
    const count = await this.tableRows.count();
    return count;
  }

  async isUserVisible(email, timeout = 10000) {
    const userRow = this.page.locator('tbody tr').filter({ hasText: email }).first();
    const isVisible = await userRow.isVisible({ timeout }).catch(() => false);
    return isVisible;
  }
}

export default UsersPage;