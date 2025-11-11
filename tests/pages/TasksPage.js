const { expect } = require('@playwright/test')
const { tableElements } = require('../utils/constants.js')

class TasksPage {
  constructor(page) {
    this.page = page
    this.header = page.getByRole('heading', { name: 'Tasks' })
    this.createButton = page.getByRole('button', { name: tableElements.createButton })
    this.exportButton = page.getByRole('button', { name: tableElements.exportButton })
  }

  async waitForPageLoaded() {
    await expect(this.header).toBeVisible()
    await expect(this.createButton).toBeVisible()
  }

  async verifyTasksTable() {
    const taskRows = this.page.locator('tbody tr')
    await expect(taskRows.first()).toBeVisible()
  }

  getTaskRow(index) {
    return this.page.locator('tr').nth(index + 1)
  }

  async clickShowForTask(index) {
    const row = this.getTaskRow(index)
    await row.getByRole('button', { name: tableElements.showButton }).click()
  }

  async clickEditForTask(index) {
    const row = this.getTaskRow(index)
    await row.getByRole('button', { name: tableElements.editButton }).click()
  }
}

module.exports = TasksPage