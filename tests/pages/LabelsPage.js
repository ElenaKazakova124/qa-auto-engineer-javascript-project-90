import BasePage from './BasePage.js'

class LabelsPage extends BasePage {
  constructor(page) {
    super(page)
    this.createButton = page.locator('button:has-text("CREATE")')
    this.nameField = page.getByLabel('Name*')
    this.saveButton = page.locator('button:has-text("SAVE")')
  }

  async waitForPageLoaded() {
    await this.waitForElement(this.createButton)
  }

  async clickCreate() {
    await this.click(this.createButton)
    await this.waitForPageLoad()
  }

  async fillLabelForm(name) {
    await this.fill(this.nameField, name)
  }

  async clickSave() {
    await this.click(this.saveButton)
    await this.waitForPageLoad()
  }

  async createLabel(name) {
    await this.clickCreate()
    await this.fillLabelForm(name)
    await this.clickSave()
  }
}

export default LabelsPage