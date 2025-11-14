import BasePage from './BasePage.js'

class StatusesPage extends BasePage {
  constructor(page) {
    super(page)
    this.createButton = page.locator('button:has-text("Create")')
    this.nameField = page.getByLabel('Name')
    this.slugField = page.getByLabel('Slug')
    this.saveButton = page.locator('button:has-text("Save")')
    this.pageTitle = page.locator('h1, h2, h3').filter({ hasText: /Statuses?/i })
  }

  async waitForPageLoaded() {
    await this.helpers.diagnosePageState(this.page, 'StatusesPage')
    
    await Promise.race([
      this.pageTitle.waitFor({ state: 'visible', timeout: 15000 }),
      this.createButton.waitFor({ state: 'visible', timeout: 15000 }),
      this.page.locator('button:has-text("Export")').waitFor({ state: 'visible', timeout: 15000 })
    ])
  }

  async openCreateForm() {
    console.log('Opening create form for statuses...')
    await this.helpers.clickCreate(this.page)
    await this.waitForElement(this.nameField, 10000)
  }

  async fillStatusForm(name, slug) {
    await this.fill(this.nameField, name)
    if (slug && await this.slugField.isVisible()) {
      await this.fill(this.slugField, slug)
    }
  }

  async saveForm() {
    await this.helpers.clickSave(this.page)
  }

  async createStatus(name, slug = '') {
    await this.openCreateForm()
    await this.fillStatusForm(name, slug)
    await this.saveForm()
  }
}

export default StatusesPage