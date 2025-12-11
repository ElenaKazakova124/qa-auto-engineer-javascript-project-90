import BasePage from './BasePage.js';
import constants from '../utils/constants.js';
import helpers from '../utils/helpers.js';

class LabelsPage extends BasePage {
  constructor(page) {
    super(page);
    this.createButton = this.page.locator(`a:has-text("${constants.tableElements.createButton}")`).first();
    this.nameInput = this.page.locator('input[name="name"]').first();
    this.saveButton = this.page.locator(`button:has-text("${constants.tableElements.saveButton}")`).first();
    this.saveChangesButton = this.page.locator(`button:has-text("${constants.tableElements.saveChangesButton}")`).first();
    this.labelsLink = this.page.locator(`a:has-text("${constants.mainPageElements.labelMenuItemLabel}")`).first();
    
    this.tableRows = this.page.locator('tbody tr');
    this.selectAllCheckbox = this.page.locator('thead input[type="checkbox"]').first();
    this.deleteSelectedButton = this.page.locator(`button:has-text("${constants.tableElements.deleteSelected}")`).first();

    this.editButtons = this.page.locator(`button:has-text("${constants.tableElements.editButton}")`);
    this.deleteButtons = this.page.locator(`button:has-text("${constants.tableElements.deleteButton}")`);
    this.confirmButton = this.page.locator(`button:has-text("${constants.tableElements.confirmButton}")`).first();
  }

  async goto() {
    await this.click(this.labelsLink);
    await this.page.waitForURL('**/labels');
  }

  async openCreateForm() {
    await this.click(this.createButton);
    await this.waitForElement(this.nameInput, 5000);
  }

  async createLabel(name = null) {
    const labelName = name || helpers.generateName('Label');
    await this.openCreateForm();
    await this.fill(this.nameInput, labelName);
    await this.click(this.saveButton);
    
    await this.page.waitForURL('**/labels', { timeout: 10000 });
    await helpers.waitForPageLoad(this.page);
    
    return labelName;
  }

  async editLabel(oldName, newName) {
    const labelRow = this.page.locator(`tr:has-text("${oldName}")`).first();
    
    if (await labelRow.isVisible({ timeout: 5000 })) {
      const editButton = labelRow.locator(`button:has-text("${constants.tableElements.editButton}")`).first();
      await editButton.click();
      await this.waitForElement(this.nameInput, 5000);
      await this.fill(this.nameInput, newName);

      const saveBtn = this.saveButton.or(this.saveChangesButton).first();
      await saveBtn.click();
      await this.page.waitForURL('**/labels', { timeout: 10000 });
      await helpers.waitForPageLoad(this.page);
      
      return newName;
    } else {
      throw new Error(`Label with name ${oldName} not found`);
    }
  }

  async deleteLabel(labelName) {
    const labelRow = this.page.locator(`tr:has-text("${labelName}")`).first();
    
    if (await labelRow.isVisible({ timeout: 5000 })) {
      const deleteButton = labelRow.locator(`button:has-text("${constants.tableElements.deleteButton}")`).first();
      await deleteButton.click();
    
      if (await this.confirmButton.isVisible({ timeout: 3000 })) {
        await this.confirmButton.click();
      }
      await this.page.waitForTimeout(2000);
      
      return true;
    } else {
      return false;
    }
  }

  async massDeleteLabels() {
    
    if (await this.selectAllCheckbox.isVisible({ timeout: 3000 })) {
      await this.selectAllCheckbox.check();
      await helpers.waitForTimeout(1000);
      
      if (await this.deleteSelectedButton.isVisible({ timeout: 3000 })) {
        await this.deleteSelectedButton.click();
        
        if (await this.confirmButton.isVisible({ timeout: 3000 })) {
          await this.confirmButton.click();
          await helpers.waitForTimeout(2000);
        }
      }
    }
  }

  async getLabelCount() {
    return await this.tableRows.count();
  }

  async isLabelVisible(labelName) {
    const labelRow = this.page.locator(`tr:has-text("${labelName}")`).first();
    return await labelRow.isVisible({ timeout: 3000 });
  }

  async getAllLabels() {
    const labels = [];
    const count = await this.getLabelCount();
    
    for (let i = 0; i < count; i++) {
      const row = this.tableRows.nth(i);
      const name = await row.locator('td:nth-child(2)').textContent();
      
      labels.push(name);
    }
    
    return labels;
  }

  async verifyLabelDetails(labelName, expectedName) {
    const labelRow = this.page.locator(`tr:has-text("${labelName}")`).first();
    
    if (await labelRow.isVisible({ timeout: 3000 })) {
      const actualName = await labelRow.locator('td:nth-child(2)').textContent();
      return actualName === expectedName;
    }
    
    return false;
  }
}

export default LabelsPage;