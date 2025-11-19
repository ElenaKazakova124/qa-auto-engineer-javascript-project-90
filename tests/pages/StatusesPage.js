import BasePage from './BasePage.js'

class StatusesPage extends BasePage {
  constructor(page) {
    super(page)
    this.createButton = page.locator('button:has-text("CREATE")')
    this.nameField = page.getByLabel('Name *')
    this.slugField = page.getByLabel('Slug *')
    this.saveButton = page.locator('button:has-text("SAVE")')
    this.pageTitle = page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /Task statuses?/i })
  }

  async waitForPageLoaded() {
    await this.waitForElement(this.pageTitle, 15000)
    await this.waitForElement(this.createButton, 10000)
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

  async clickEdit(statusName) {
    const statusRow = this.page.locator('tr', { has: this.page.getByText(statusName) })
    const editButton = statusRow.locator('button:has-text("EDIT")')
    await this.click(editButton)
    await this.waitForModal()
  }

  async clickDelete(statusName) {
    const statusRow = this.page.locator('tr', { has: this.page.getByText(statusName) })
    const deleteButton = statusRow.locator('button:has-text("DELETE")')
    await this.click(deleteButton)
  }
}

export default StatusesPage