const { expect } = require('@playwright/test')

class LabelsPage {
  constructor(page) {
    this.page = page
    this.header = page.getByRole('heading', { name: 'Labels' })
    this.createButton = page.getByRole('button', { name: 'CREATE' })
    this.saveButton = page.getByRole('button', { name: 'SAVE' })
    this.bulkDeleteButton = page.getByRole('button', { name: 'Delete' })
  }

  async waitForPageLoaded() {
    await expect(this.header).toBeVisible()
    await expect(this.createButton).toBeVisible()
  }

  get nameInput() { return this.page.getByLabel('Name*') }
  get validationError() { return this.page.locator('.Mui-error') }

  async clickCreateLabel() {
    await this.createButton.click()
    await expect(this.nameInput).toBeVisible({ timeout: 5000 })
  }

  async clickEditForLabel(name) {
    const row = this.page.locator('tr', { has: this.page.getByText(name) })
    await row.getByRole('button', { name: 'EDIT' }).first().click()
    await expect(this.nameInput).toBeVisible({ timeout: 5000 })
  }

  async clickDeleteForLabel(name) {
    const row = this.page.locator('tr', { has: this.page.getByText(name) })
    await row.getByRole('button', { name: 'Delete' }).click()
  }

  async fillLabelForm(name) {
    if (name !== undefined) {
      await this.nameInput.clear()
      await this.nameInput.fill(name)
    }
  }

  async saveLabelForm() {
    await this.saveButton.click()
  }

  async confirmDelete() {
    await this.page.getByRole('button', { name: 'Confirm' }).click()
  }

  async selectLabel(name) {
    const row = this.page.locator('tr', { has: this.page.getByText(name) })
    const checkbox = row.locator('input[type="checkbox"]')
    await checkbox.check()
  }

  async selectAllLabels() {
    const bulkCheckbox = this.page.locator('thead input[type="checkbox"]')
    await bulkCheckbox.check()
  }

  async clickBulkDelete() {
    await this.bulkDeleteButton.click()
  }

  async verifyLabelInTable(name) {
    const row = this.page.locator('tr', { has: this.page.getByText(name) })
    await expect(row).toBeVisible()
  }

  async verifyLabelNotInTable(name) {
    const row = this.page.locator('tr', { has: this.page.getByText(name) })
    await expect(row).not.toBeVisible()
  }

  async verifyFormValidation() {
    await expect(this.validationError).toBeVisible()
  }
}

module.exports = LabelsPage