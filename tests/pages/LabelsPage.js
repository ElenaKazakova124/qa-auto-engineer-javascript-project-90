import BasePage from './BasePage.js'

class LabelsPage extends BasePage {
  constructor(page) {
    super(page)
    this.createButton = page.locator('button:has-text("Create")')
    this.nameField = page.getByLabel('Name')
    this.saveButton = page.locator('button:has-text("Save")')
    this.pageTitle = page.locator('h1, h2, h3').filter({ hasText: /Labels?/i })
  }

  async waitForPageLoaded() {
    await this.helpers.diagnosePageState(this.page, 'LabelsPage')
    
    await Promise.race([
      this.pageTitle.waitFor({ state: 'visible', timeout: 15000 }),
      this.createButton.waitFor({ state: 'visible', timeout: 15000 }),
      this.page.locator('button:has-text("Export")').waitFor({ state: 'visible', timeout: 15000 })
    ])
  }

  async openCreateForm() {
    console.log('Opening create form for labels...')
    
    await this.helpers.clickCreate(this.page)
    
    await this.waitForElement(this.nameField, 10000)
  }

  async fillLabelForm(name) {
    await this.fill(this.nameField, name)
  }

  async saveForm() {
    await this.helpers.clickSave(this.page)
  }

  async createLabel(name) {
    await this.openCreateForm()
    await this.fillLabelForm(name)
    await this.saveForm()
  }
}

export default LabelsPage