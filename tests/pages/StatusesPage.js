// tests/pages/StatusesPage.js
import BasePage from './BasePage.js'

class StatusesPage extends BasePage {
  constructor(page) {
    super(page)
    // Используем несколько вариантов локаторов
    this.createButton = page.locator('button:has-text("+ CREATE"), button:has-text("CREATE"), button:has-text("Create"), [aria-label*="create"], [aria-label*="add"]').first()
    this.nameField = page.getByLabel('Name*')
    this.slugField = page.getByLabel('Slug*')
    this.saveButton = page.locator('button:has-text("SAVE"), button[type="submit"]').first()
  }

  async waitForPageLoaded() {
    // Ждем появления любой релевантной кнопки или элемента
    await Promise.race([
      this.createButton.waitFor({ state: 'visible', timeout: 20000 }),
      this.page.locator('button:has-text("Export")').waitFor({ state: 'visible', timeout: 20000 }),
      this.page.locator('h2:has-text("Statuses")').waitFor({ state: 'visible', timeout: 20000 })
    ])
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