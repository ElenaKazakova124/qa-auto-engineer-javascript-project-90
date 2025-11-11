const { expect } = require('@playwright/test')
const { tableElements, expectedData } = require('../utils/constants.js')

class StatusesPage {
  constructor(page) {
    this.page = page
    this.header = page.getByRole('heading', { name: 'Task statuses' })
    this.createButton = page.getByRole('button', { name: tableElements.createButton })
    this.exportButton = page.getByRole('button', { name: tableElements.exportButton })
    this.searchInput = page.getByPlaceholder(tableElements.searchInput)
  }

  async waitForPageLoaded() {
    await expect(this.header).toBeVisible()
    await expect(this.createButton).toBeVisible()
  }

  async verifyStatusesTable() {
    for (const status of expectedData.statuses) {
      await expect(this.page.getByText(status)).toBeVisible()
    }
  }

  getStatusRow(statusName) {
    return this.page.locator('tr', { has: this.page.getByText(statusName) })
  }

  async clickShowForStatus(statusName) {
    const row = this.getStatusRow(statusName)
    await row.getByRole('button', { name: tableElements.showButton }).click()
  }

  async clickEditForStatus(statusName) {
    const row = this.getStatusRow(statusName)
    await row.getByRole('button', { name: tableElements.editButton }).click()
  }
}

module.exports = StatusesPage