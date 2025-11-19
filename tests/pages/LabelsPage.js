import BasePage from './BasePage.js'

class LabelsPage extends BasePage {
  constructor(page) {
    super(page)
    this.createButton = page.locator('button:has-text("Create")')
    this.exportButton = page.locator('button:has-text("Export")')
    this.nameField = page.getByLabel('Name')
    this.saveButton = page.locator('button:has-text("Save")')
    this.pageTitle = page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /Labels?/i })
  }

  async waitForPageLoaded() {
    await Promise.race([
      this.pageTitle.waitFor({ state: 'visible', timeout: 15000 }),
      this.createButton.waitFor({ state: 'visible', timeout: 15000 }),
      this.exportButton.waitFor({ state: 'visible', timeout: 15000 })
    ])
    console.log('Labels page loaded successfully')
  }

  async openCreateForm() {
    console.log('Opening create form for labels...')
    await this.click(this.createButton)
    await this.waitForModal()
    await this.waitForElement(this.nameField, 10000)
  }

  async fillLabelForm(name) {
    await this.fill(this.nameField, name)
  }

  async saveForm() {
    await this.click(this.saveButton)
  }

  async createLabel(name) {
    await this.openCreateForm()
    await this.fillLabelForm(name)
    await this.saveForm()
  }
}

export default LabelsPage