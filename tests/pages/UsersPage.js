const { expect } = require('@playwright/test')
const { tableElements, expectedData } = require('../utils/constants.js')

class UsersPage {
  constructor(page) {
    this.page = page
    this.header = page.getByRole('heading', { name: 'Users' })
    this.createButton = page.getByRole('button', { name: tableElements.createButton })
    this.exportButton = page.getByRole('button', { name: tableElements.exportButton })
    this.searchInput = page.getByPlaceholder(tableElements.searchInput)
    this.bulkDeleteButton = page.getByRole('button', { name: 'Delete' })
    this.saveButton = page.getByRole('button', { name: 'SAVE' })
  }

  async waitForPageLoaded() {
    await expect(this.header).toBeVisible()
    await expect(this.createButton).toBeVisible()
  }

  async verifyUsersTable() {
    for (const user of expectedData.users) {
      await expect(this.page.getByText(user.email)).toBeVisible()
      await expect(this.page.getByText(user.firstName)).toBeVisible()
      await expect(this.page.getByText(user.lastName)).toBeVisible()
    }
  }

  get emailInput() { return this.page.getByLabel('Email*') }
  get firstNameInput() { return this.page.getByLabel('First name*') }
  get lastNameInput() { return this.page.getByLabel('Last name*') }
  get validationError() { return this.page.locator('.Mui-error') }

  getUserRow(email) {
    return this.page.locator('tr', { has: this.page.getByText(email) })
  }

  async getCheckboxForUser(email) {
    const row = this.getUserRow(email)
    return row.locator('input[type="checkbox"]')
  }

  async getBulkCheckbox() {
    return this.page.locator('thead input[type="checkbox"]')
  }

  async clickCreateUser() {
    await this.createButton.click()
    await expect(this.emailInput).toBeVisible({ timeout: 5000 })
  }

  async clickShowForUser(email) {
    const row = this.getUserRow(email)
    await row.getByRole('button', { name: tableElements.showButton }).first().click()
  }

  async clickEditForUser(email) {
    const row = this.getUserRow(email)
    await row.getByRole('button', { name: tableElements.editButton }).first().click()
    await expect(this.emailInput).toBeVisible({ timeout: 5000 })
  }

  async clickDeleteForUser(email) {
    const row = this.getUserRow(email)
    await row.getByRole('button', { name: tableElements.deleteButton }).click()
  }

  async fillUserForm(email, firstName, lastName) {
    if (email) {
      await this.emailInput.clear()
      await this.emailInput.fill(email)
    }
    if (firstName) {
      await this.firstNameInput.clear()
      await this.firstNameInput.fill(firstName)
    }
    if (lastName) {
      await this.lastNameInput.clear()
      await this.lastNameInput.fill(lastName)
    }
  }

  async saveUserForm() {
    await this.saveButton.click()
  }

  async selectUser(email) {
    const checkbox = await this.getCheckboxForUser(email)
    await checkbox.check()
  }

  async selectAllUsers() {
    const bulkCheckbox = await this.getBulkCheckbox()
    await bulkCheckbox.check()
  }

  async clickBulkDelete() {
    await this.bulkDeleteButton.click()
  }

  async confirmDelete() {
    await this.page.getByRole('button', { name: 'Confirm' }).click()
  }

  async verifyUserInTable(email, firstName, lastName) {
    const row = this.getUserRow(email)
    await expect(row).toBeVisible()
    if (firstName) await expect(row.getByText(firstName)).toBeVisible()
    if (lastName) await expect(row.getByText(lastName)).toBeVisible()
  }

  async verifyUserNotInTable(email) {
    const row = this.getUserRow(email)
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

  async verifyRequiredFields() {
    const emailLabel = await this.page.getByText('Email*')
    const firstNameLabel = await this.page.getByText('First name*')
    const lastNameLabel = await this.page.getByText('Last name*')
    
    await expect(emailLabel).toBeVisible()
    await expect(firstNameLabel).toBeVisible()
    await expect(lastNameLabel).toBeVisible()
  }
}

module.exports = UsersPage