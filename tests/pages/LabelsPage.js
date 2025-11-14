// tests/pages/LabelsPage.js
import BasePage from './BasePage.js'

class LabelsPage extends BasePage {
  constructor(page) {
    super(page)
    this.createButton = page.locator('button:has-text("+ CREATE"), button:has-text("CREATE"), button:has-text("Create"), [aria-label*="create"], [aria-label*="add"]').first()
    this.nameField = page.getByLabel('Name*')
    this.saveButton = page.locator('button:has-text("SAVE"), button[type="submit"]').first()
  }

  async waitForPageLoaded() {
    await Promise.race([
      this.createButton.waitFor({ state: 'visible', timeout: 20000 }),
      this.page.locator('button:has-text("Export")').waitFor({ state: 'visible', timeout: 20000 }),
      this.page.locator('h2:has-text("Labels")').waitFor({ state: 'visible', timeout: 20000 })
    ])
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