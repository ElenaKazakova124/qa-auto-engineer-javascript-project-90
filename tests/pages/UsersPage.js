const { expect } = require('@playwright/test')

class UsersPage {
  constructor(page) {
    this.page = page
    this.header = page.getByRole('heading', { name: 'Users' })
    this.createButton = page.getByRole('button', { name: 'CREATE' })
    this.searchInput = page.getByPlaceholder('Search...')
    this.saveButton = page.getByRole('button', { name: 'SAVE' })
    this.bulkDeleteButton = page.getByRole('button', { name: 'Delete' })
  }

  async waitForPageLoaded() {
    await expect(this.header).toBeVisible()
    await expect(this.createButton).toBeVisible()
  }

  get emailInput() { return this.page.getByLabel('Email*') }
  get firstNameInput() { return this.page.getByLabel('First name*') }
  get lastNameInput() { return this.page.getByLabel('Last name*') }
  get validationError() { return this.page.locator('.Mui-error') }

  async clickCreateUser() {
    await this.createButton.click()
    await expect(this.emailInput).toBeVisible({ timeout: 5000 })
  }

  async clickEditForUser(email) {
    const row = this.page.locator('tr', { has: this.page.getByText(email) })
    await row.getByRole('button', { name: 'EDIT' }).first().click()
    await expect(this.emailInput).toBeVisible({ timeout: 5000 })
  }

  async clickDeleteForUser(email) {
    const row = this.page.locator('tr', { has: this.page.getByText(email) })
    await row.getByRole('button', { name: 'Delete' }).click()
  }

  async fillUserForm(email, firstName, lastName) {
    if (email !== undefined) {
      await this.emailInput.clear()
      await this.emailInput.fill(email)
    }
    if (firstName !== undefined) {
      await this.firstNameInput.clear()
      await this.firstNameInput.fill(firstName)
    }
    if (lastName !== undefined) {
      await this.lastNameInput.clear()
      await this.lastNameInput.fill(lastName)
    }
  }

  async saveUserForm() {
    await this.saveButton.click()
  }

  async confirmDelete() {
    await this.page.getByRole('button', { name: 'Confirm' }).click()
  }

  async selectUser(email) {
    const row = this.page.locator('tr', { has: this.page.getByText(email) })
    const checkbox = row.locator('input[type="checkbox"]')
    await checkbox.check()
  }

  async selectAllUsers() {
    const bulkCheckbox = this.page.locator('thead input[type="checkbox"]')
    await bulkCheckbox.check()
  }

  async clickBulkDelete() {
    await this.bulkDeleteButton.click()
  }

  async verifyUserInTable(email, firstName, lastName) {
    const row = this.page.locator('tr', { has: this.page.getByText(email) })
    await expect(row).toBeVisible()
    if (firstName) {
      await expect(row.getByText(firstName)).toBeVisible()
    }
    if (lastName) {
      await expect(row.getByText(lastName)).toBeVisible()
    }
  }

  async verifyUserNotInTable(email) {
    const row = this.page.locator('tr', { has: this.page.getByText(email) })
    await expect(row).not.toBeVisible()
  }

  async verifyFormValidation() {
    await expect(this.validationError).toBeVisible()
  }

  async verifyFormLoaded() {
    await expect(this.emailInput).toBeVisible()
    await expect(this.firstNameInput).toBeVisible()
    await expect(this.lastNameInput).toBeVisible()
    await expect(this.saveButton).toBeVisible()
  }
}

module.exports = UsersPage