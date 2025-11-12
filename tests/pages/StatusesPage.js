const BasePage = require('./BasePage')

class StatusesPage extends BasePage {
  constructor(page) {
    super(page)
    this.header = page.getByRole('heading', { name: 'Task statuses' })
    this.createButton = page.getByRole('button', { name: 'CREATE' })
    this.saveButton = page.getByRole('button', { name: 'SAVE' })
    this.nameInput = page.getByLabel('Name*')
    this.slugInput = page.getByLabel('Slug*')
  }

  async waitForPageLoaded() {
    await this.waitForElement(this.header)
    await this.waitForElement(this.createButton)
  }

  async createStatus(name, slug) {
    await this.click(this.createButton)
    await this.fill(this.nameInput, name)
    await this.fill(this.slugInput, slug)
    await this.click(this.saveButton)
  }

  async editStatus(oldName, newName, newSlug) {
    await this.clickEditButton(oldName)
    await this.fill(this.nameInput, newName)
    await this.fill(this.slugInput, newSlug)
    await this.click(this.saveButton)
  }

  async clickEditButton(name) {
    const row = this.page.locator('tr', { has: this.page.getByText(name) })
    await row.getByRole('button', { name: 'EDIT' }).first().click()
  }

  async deleteStatus(name) {
    await this.clickDeleteButton(name)
    await this.helpers.clickConfirm(this.page)
  }

  async clickDeleteButton(name) {
    const row = this.page.locator('tr', { has: this.page.getByText(name) })
    await row.getByRole('button', { name: 'Delete' }).click()
  }

  async verifyStatusesTable() {
    const rows = await this.helpers.getRowCount(this.page)
    if (rows === 0) {
      await this.shouldSee('Draft')
    }
  }
}

module.exports = StatusesPage