import BasePage from './BasePage.js';
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
      await this.page.waitForLoadState('networkidle');
    } catch (_error) {
      try {
        await this.page.locator('a:has-text("Labels")').first().click({ timeout: 15000 });
        await helpers.waitForPageLoad(this.page);
        await this.page.waitForLoadState('networkidle');
      } catch (_e) {
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
    
    
    try {
      await this.openCreateForm();
    } catch (_error) {
      await this.goto();
      await this.page.waitForLoadState('networkidle');
      
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
    await this.page.waitForLoadState('networkidle');
    
    return labelName;
  }

  async editLabel(oldName, newName) {
    await this.goto();
    await this.page.waitForLoadState('networkidle');
    
    
    if (!await this.isLabelVisible(oldName, 10000)) {
      await this.createLabel(oldName);
      await this.page.waitForLoadState('networkidle');
      await this.goto();
      await this.page.waitForLoadState('networkidle');
    }
    
    const labelRow = this.page.locator('tbody tr').filter({ hasText: oldName }).first();
    
    if (await labelRow.isVisible({ timeout: 15000 })) {
      
      await labelRow.click({ force: true });
      
      await this.waitForElement(this.nameInput, 20000);
      await this.page.waitForLoadState('networkidle');
      
      await this.clear(this.nameInput);
      await this.fill(this.nameInput, newName);
      
      await this.click(this.saveButton);
      
      await helpers.waitForPageLoad(this.page);
      await this.page.waitForLoadState('networkidle');
      
      await this.goto();
      await this.page.locator('tbody tr').first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
      
      return newName;
    } else {
      return oldName;
    }
  }

  async deleteLabel(labelName) {
    await this.goto();
    await this.page.waitForLoadState('networkidle');
    
    
    if (!await this.isLabelVisible(labelName, 10000)) {
      await this.createLabel(labelName);
      await this.page.waitForLoadState('networkidle');
      await this.goto();
      await this.page.waitForLoadState('networkidle');
    }
    
    const labelRow = this.page.locator('tbody tr').filter({ hasText: labelName }).first();
    
    if (await labelRow.isVisible({ timeout: 15000 })) {
      
      const checkbox = labelRow.locator('td:first-child input[type="checkbox"]').first();
      
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
            await labelRow.waitFor({ state: 'hidden', timeout: 5000 });
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

  async massDeleteLabels() {
    await this.goto();
    await this.page.waitForLoadState('networkidle');
    
    
    const testLabels = [];
    for (let i = 1; i <= 3; i++) {
      const labelName = `TestLabel${i}_${Date.now()}`;
      await this.createLabel(labelName);
      testLabels.push(labelName);
      await this.page.waitForLoadState('networkidle');
    }
    
    await this.page.waitForLoadState('networkidle');
    await this.goto();
    await this.page.waitForLoadState('networkidle');
    
    for (const labelName of testLabels) {
      const labelRow = this.page.locator('tbody tr').filter({ hasText: labelName }).first();
      if (await labelRow.isVisible({ timeout: 5000 })) {
        const checkbox = labelRow.locator('td:first-child input[type="checkbox"]').first();
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
      for (const labelName of testLabels) {
        const isStillVisible = await this.isLabelVisible(labelName);
        if (isStillVisible) {
          allDeleted = false;
        }
      }
      
      return allDeleted;
    } else {
      return false;
    }
  }

  async getLabelCount() {
    const count = await this.tableRows.count();
    return count;
  }

  async isLabelVisible(labelName, timeout = 10000) {
    const labelRow = this.page.locator('tbody tr').filter({ hasText: labelName }).first();
    const isVisible = await labelRow.isVisible({ timeout }).catch(() => false);
    return isVisible;
  }
}

export default LabelsPage;