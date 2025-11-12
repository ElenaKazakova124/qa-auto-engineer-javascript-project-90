const { expect } = require('@playwright/test')
const Helpers = require('../utils/helpers')

class BasePage {
  constructor(page) {
    this.page = page
    this.helpers = Helpers
  }

  async waitForElement(selector, timeout = 5000) {
    await expect(selector).toBeVisible({ timeout })
  }

  async click(selector) {
    await this.waitForElement(selector)
    await selector.click()
  }

  async fill(selector, value) {
    await this.waitForElement(selector)
    await selector.fill(value)
  }

  async shouldSee(text) {
    await this.helpers.shouldSee(this.page, text)
  }

  async shouldNotSee(text) {
    await this.helpers.shouldNotSee(this.page, text)
  }
}

module.exports = BasePage