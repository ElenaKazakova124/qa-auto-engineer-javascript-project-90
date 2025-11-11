const { expect } = require('@playwright/test')
const { tableElements, expectedData } = require('../utils/constants.js')

class UsersPage {
  constructor(page) {
    this.page = page
    this.header = page.getByRole('heading', { name: 'Users' })
    this.createButton = page.getByRole('button', { name: tableElements.createButton })
    this.exportButton = page.getByRole('button', { name: tableElements.exportButton })
  }

  async waitForPageLoaded() {
    await expect(this.header).toBeVisible()
    await expect(this.createButton).toBeVisible()
  }

  async verifyUsersTable() {
    for (const user of expectedData.users) {
      await expect(this.page.getByText(user)).toBeVisible()
    }
  }

  getUserRow(email) {
    return this.page.locator('tr', { has: this.page.getByText(email) })
  }

  async clickShowForUser(email) {
    const row = this.getUserRow(email)
    await row.getByRole('button', { name: tableElements.showButton }).click()
  }
}

module.exports = UsersPage