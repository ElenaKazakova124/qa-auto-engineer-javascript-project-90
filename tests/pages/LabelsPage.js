const { expect } = require('@playwright/test')
const { tableElements, expectedData } = require('../utils/constants.js')

class LabelsPage {
  constructor(page) {
    this.page = page
    this.header = page.getByRole('heading', { name: 'Labels' })
    this.createButton = page.getByRole('button', { name: tableElements.createButton })
    this.exportButton = page.getByRole('button', { name: tableElements.exportButton })
  }

  async waitForPageLoaded() {
    await expect(this.header).toBeVisible()
    await expect(this.createButton).toBeVisible()
  }

  async verifyLabelsTable() {
    for (const label of expectedData.labels) {
      await expect(this.page.getByText(label)).toBeVisible()
    }
  }

  getLabelRow(labelName) {
    return this.page.locator('tr', { has: this.page.getByText(labelName) })
  }

  async clickShowForLabel(labelName) {
    const row = this.getLabelRow(labelName)
    await row.getByRole('button', { name: tableElements.showButton }).click()
  }
}

module.exports = LabelsPage