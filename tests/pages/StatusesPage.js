const { expect } = require('@playwright/test')

class StatusesPage {
  constructor(page) {
    this.page = page
    this.header = page.getByRole('heading', { name: 'Task statuses' })
    this.createButton = page.getByRole('button', { name: 'CREATE' })
    this.searchInput = page.getByPlaceholder('Search...')
    this.saveButton = page.getByRole('button', { name: 'SAVE' })
    this.bulkDeleteButton = page.getByRole('button', { name: 'Delete' })
  }

  async waitForPageLoaded() {
    await expect(this.header).toBeVisible()
    await expect(this.createButton).toBeVisible()
  }

  get nameInput() { return this.page.getByLabel('Name*') }
  get slugInput() { return this.page.getByLabel('Slug*') }
  get validationError() { return this.page.locator('.Mui-error') }

  async clickCreateStatus() {
    await this.createButton.click()
    await expect(this.nameInput).toBeVisible({ timeout: 5000 })
  }

  async clickEditForStatus(name) {
    const row = this.page.locator('tr', { has: this.page.getByText(name) })
    await row.getByRole('button', { name: 'EDIT' }).first().click()
    await expect(this.nameInput).toBeVisible({ timeout: 5000 })
  }

  async clickDeleteForStatus(name) {
    const row = this.page.locator('tr', { has: this.page.getByText(name) })
    await row.getByRole('button', { name: 'Delete' }).click()
  }

  async fillStatusForm(name, slug) {
    if (name !== undefined) {
      await this.nameInput.clear()
      await this.nameInput.fill(name)
    }
    if (slug !== undefined) {
      await this.slugInput.clear()
      await this.slugInput.fill(slug)
    }
  }

  async saveStatusForm() {
    await this.saveButton.click()
  }

  async confirmDelete() {
    await this.page.getByRole('button', { name: 'Confirm' }).click()
  }

  async selectStatus(name) {
    const row = this.page.locator('tr', { has: this.page.getByText(name) })
    const checkbox = row.locator('input[type="checkbox"]')
    await checkbox.check()
  }

  async selectAllStatuses() {
    const bulkCheckbox = this.page.locator('thead input[type="checkbox"]')
    await bulkCheckbox.check()
  }

  async clickBulkDelete() {
    await this.bulkDeleteButton.click()
  }

  async verifyStatusInTable(name, slug) {
    const row = this.page.locator('tr', { has: this.page.getByText(name) })
    await expect(row).toBeVisible()
    if (slug) {
      await expect(row.getByText(slug)).toBeVisible()
    }
  }

  async verifyStatusNotInTable(name) {
    const row = this.page.locator('tr', { has: this.page.getByText(name) })
    await expect(row).not.toBeVisible()
  }

  async verifyFormValidation() {
    await expect(this.validationError).toBeVisible()
  }

  async verifyFormLoaded() {
    await expect(this.nameInput).toBeVisible()
    await expect(this.slugInput).toBeVisible()
    await expect(this.saveButton).toBeVisible()
  }
}

module.exports = StatusesPage