import { expect } from '@playwright/test'
import Helpers from '../utils/helpers.js'

class BasePage {
  constructor(page) {
    this.page = page
    this.helpers = Helpers
  }

  async waitForElement(selector, timeout = 10000) {
    await expect(selector).toBeVisible({ timeout })
  }

  async waitForElementHidden(selector, timeout = 5000) {
    await expect(selector).toBeHidden({ timeout })
  }

  async click(selector) {
    await this.waitForElement(selector)
    await selector.click()
  }

  async fill(selector, value) {
    await this.waitForElement(selector)
    await selector.fill(value)
  }

  async getText(selector) {
    await this.waitForElement(selector)
    return await selector.textContent()
  }

  async shouldSee(text) {
    await this.helpers.shouldSee(this.page, text)
  }

  async shouldNotSee(text) {
    await this.helpers.shouldNotSee(this.page, text)
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
  }
}

export default BasePage