import BasePage from './BasePage.js'

class StatusesPage extends BasePage {
  constructor(page) {
    super(page)
    this.createButton = page.locator('button:has-text("Create")')
    this.exportButton = page.locator('button:has-text("Export")')
    this.nameField = page.getByLabel('Name')
    this.slugField = page.getByLabel('Slug')
    this.saveButton = page.locator('button:has-text("Save")')
    this.pageTitle = page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /Statuses?/i })
  }

  async waitForPageLoaded() {
    await Promise.race([
      this.pageTitle.waitFor({ state: 'visible', timeout: 15000 }),
      this.createButton.waitFor({ state: 'visible', timeout: 15000 }),
      this.exportButton.waitFor({ state: 'visible', timeout: 15000 })
    ])
    console.log('Statuses page loaded successfully')
  }

  async openCreateForm() {
    console.log('Opening create form for statuses...')
    await this.click(this.createButton)
    await this.waitForModal()
    await this.waitForElement(this.nameField, 10000)
  }

  async fillStatusForm(name, slug) {
    await this.fill(this.nameField, name)
    await this.fill(this.slugField, slug)
  }

  async saveForm() {
    await this.click(this.saveButton)
  }

  async createStatus(name, slug) {
    await this.openCreateForm()
    await this.fillStatusForm(name, slug)
    await this.saveForm()
  }
}

export default StatusesPage