import BasePage from './BasePage.js'

class LabelsPage extends BasePage {
  constructor(page) {
    super(page)
    this.header = page.getByRole('heading', { name: 'Labels' })
    this.createButton = page.getByRole('button', { name: 'CREATE' })
    this.saveButton = page.getByRole('button', { name: 'SAVE' })
    this.nameInput = page.getByLabel('Name*')
  }

  async waitForPageLoaded() {
    await this.waitForElement(this.header)
    await this.waitForElement(this.createButton)
  }

  async createLabel(name) {
    await this.click(this.createButton)
    await this.fill(this.nameInput, name)
    await this.click(this.saveButton)
  }

  async editLabel(oldName, newName) {
    await this.clickEditButton(oldName)
    await this.fill(this.nameInput, newName)
    await this.click(this.saveButton)
  }

  async clickEditButton(name) {
    const row = this.page.locator('tr', { has: this.page.getByText(name) })
    await row.getByRole('button', { name: 'EDIT' }).first().click()
  }

  async deleteLabel(name) {
    await this.clickDeleteButton(name)
    await this.helpers.clickConfirm(this.page)
  }

  async clickDeleteButton(name) {
    const row = this.page.locator('tr', { has: this.page.getByText(name) })
    await row.getByRole('button', { name: 'Delete' }).click()
  }

  async verifyLabelsTable() {
    const rows = await this.helpers.getRowCount(this.page)
    if (rows === 0) {
      await this.shouldSee('bug')
    }
  }
}

export default LabelsPage