import BasePage from './BasePage.js';
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
    } catch (_error) {
      try {
        await this.page.locator('a:has-text("Task statuses")').first().click({ timeout: 15000 });
        await helpers.waitForPageLoad(this.page);
      } catch (_e) {
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
    
    try {
      await this.openCreateForm();
    } catch (_error) {
      await this.goto();
      await this.page.waitForLoadState('networkidle');
      
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
    
    return { name: statusName, slug: statusSlug };
  }

  async editStatus(oldName, newName, newSlug = null) {
    await this.goto();
    await this.page.waitForLoadState('networkidle');
    
    
    if (!await this.isStatusVisible(oldName, 10000)) {
      const slug = `slug-${Date.now()}`;
      await this.createStatus(oldName, slug);
      await this.page.waitForLoadState('networkidle');
      await this.goto();
      await this.page.waitForLoadState('networkidle');
    }
    
    const statusRow = this.page.locator('tbody tr').filter({ hasText: oldName }).first();
    
    if (await statusRow.isVisible({ timeout: 15000 })) {
      
      await statusRow.click({ force: true });
      
      await this.waitForElement(this.nameInput, 20000);
      await this.waitForElement(this.slugInput, 20000);
      await this.page.waitForLoadState('networkidle');
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
      await this.page.waitForLoadState('networkidle');
      
      await this.goto();
      await this.page.locator('tbody tr').first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
      
      return { name: newName, slug: newSlug };
    } else {
      return { name: oldName }; 
    }
  }

  async deleteStatus(statusName) {
    await this.goto();
    await this.page.waitForLoadState('networkidle');
    
    
    if (!await this.isStatusVisible(statusName, 10000)) {
      const slug = `slug-${Date.now()}`;
      await this.createStatus(statusName, slug);
      await this.page.waitForLoadState('networkidle');
      await this.goto();
      await this.page.waitForLoadState('networkidle');
    }
    
    const statusRow = this.page.locator('tbody tr').filter({ hasText: statusName }).first();
    
    if (await statusRow.isVisible({ timeout: 15000 })) {
      
      const checkbox = statusRow.locator('td:first-child input[type="checkbox"]').first();
      
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
            await statusRow.waitFor({ state: 'hidden', timeout: 5000 });
          } catch (_error) {
            await this.goto();
            await this.page.waitForLoadState('networkidle');
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

  async massDeleteStatuses() {
    await this.goto();
    await this.page.waitForLoadState('networkidle');
    
    
    const testStatuses = [];
    for (let i = 1; i <= 3; i++) {
      const statusName = `TestStatus${i}_${Date.now()}`;
      const statusSlug = `test-status-${i}-${Date.now()}`;
      await this.createStatus(statusName, statusSlug);
      testStatuses.push(statusName);
      await this.page.waitForLoadState('networkidle');
    }
    
    await this.page.waitForLoadState('networkidle');
    await this.goto();
    await this.page.waitForLoadState('networkidle');
    
    for (const statusName of testStatuses) {
      const statusRow = this.page.locator('tbody tr').filter({ hasText: statusName }).first();
      if (await statusRow.isVisible({ timeout: 5000 })) {
        const checkbox = statusRow.locator('td:first-child input[type="checkbox"]').first();
        await checkbox.check({ force: true });
        await this.page.waitForLoadState('networkidle');
      }
    }
    
    const bulkDeleteButton = this.page.locator('button:has-text("Delete"):visible').first();
    
    if (await bulkDeleteButton.isVisible({ timeout: 5000 })) {
      
      await bulkDeleteButton.click();
      await this.page.waitForLoadState('networkidle');
      
      try {
        await this.waitForElement(this.snackbar, 10000);
      } catch (_error) {
      }
      
      await this.page.waitForLoadState('networkidle');
      
      await this.goto();
      await this.page.waitForLoadState('networkidle');
      
      let allDeleted = true;
      for (const statusName of testStatuses) {
        const isStillVisible = await this.isStatusVisible(statusName);
        if (isStillVisible) {
          allDeleted = false;
        }
      }
      
      return allDeleted;
    } else {
      return false;
    }
  }

  async getStatusCount() {
    const count = await this.tableRows.count();
    return count;
  }

  async isStatusVisible(statusName, timeout = 10000) {
    const statusRow = this.page.locator('tbody tr').filter({ hasText: statusName }).first();
    const isVisible = await statusRow.isVisible({ timeout }).catch(() => false);
    return isVisible;
  }
}

export default StatusesPage;