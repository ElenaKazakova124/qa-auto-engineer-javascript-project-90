import BasePage from './BasePage.js'

class LabelsPage extends BasePage {
  constructor(page) {
    super(page)
    this.createButton = page.locator('button:has-text("+ CREATE")')
    this.nameField = page.getByLabel('Name *')
    this.saveButton = page.locator('button:has-text("SAVE")')
    this.pageTitle = page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /Labels?/i })
  }

  async waitForPageLoaded() {
    await this.waitForElement(this.pageTitle, 15000)
    await this.waitForElement(this.createButton, 10000)
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

  async clickEdit(labelName) {
    const labelRow = this.page.locator('tr', { has: this.page.getByText(labelName) })
    const editButton = labelRow.locator('button:has-text("EDIT")')
    await this.click(editButton)
    await this.waitForModal()
  }

  async clickDelete(labelName) {
    const labelRow = this.page.locator('tr', { has: this.page.getByText(labelName) })
    const deleteButton = labelRow.locator('button:has-text("DELETE")')
    await this.click(deleteButton)
  }
}

export default LabelsPage