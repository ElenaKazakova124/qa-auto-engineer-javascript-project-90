import BasePage from './BasePage.js'

class StatusesPage extends BasePage {
  constructor(page) {
    super(page)
    this.createButton = page.locator('button:has-text("+ CREATE")')
    this.nameField = page.getByLabel('Name*')
    this.slugField = page.getByLabel('Slug*')
    this.saveButton = page.locator('button:has-text("SAVE"), button[type="submit"]').first()
  }

  async waitForPageLoaded() {
    await this.waitForElement(this.createButton)
  }

  async clickCreate() {
    await this.click(this.createButton)
    await this.waitForPageLoad()
  }

  async fillStatusForm(name, slug) {
    await this.fill(this.nameField, name)
    await this.fill(this.slugField, slug)
  }

  async clickSave() {
    await this.click(this.saveButton)
    await this.waitForPageLoad()
  }

  async createStatus(name, slug) {
    await this.clickCreate()
    await this.fillStatusForm(name, slug)
    await this.clickSave()
  }
}

export default StatusesPage