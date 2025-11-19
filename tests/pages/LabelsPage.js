import BasePage from './BasePage.js';
import constants from '../utils/constants.js';

class LabelsPage extends BasePage {
  constructor(page) {
    super(page);
    this.createButton = this.page.locator(`a:has-text("${constants.tableElements.createButton}")`).first();
    this.nameInput = this.page.locator('input[name="name"]').first();
    this.saveButton = this.page.locator(`button:has-text("${constants.tableElements.saveButton}")`).first();
    this.labelsLink = this.page.locator(`a:has-text("${constants.mainPageElements.labelMenuItemLabel}")`).first();
  }

  async goto() {
    await this.click(this.labelsLink);
    await this.page.waitForURL('**/labels');
    console.log('Labels page loaded successfully');
  }

  async openCreateForm() {
    console.log('Opening create form for labels...');
    await this.click(this.createButton);
  }

  async createLabel(name = null) {
    const labelName = name || `TestLabel${Date.now()}`;
    await this.openCreateForm();
    await this.fill(this.nameInput, labelName);
    await this.click(this.saveButton);
    return labelName;
  }
}

export default LabelsPage;