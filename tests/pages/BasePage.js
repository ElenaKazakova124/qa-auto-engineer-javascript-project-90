// tests/pages/BasePage.js
import { expect } from '@playwright/test'
import Helpers from '../utils/helpers.js'

class BasePage {
  constructor(page) {
    this.page = page
    this.helpers = Helpers
  }

  async waitForElement(selector, timeout = 20000) {
    try {
      await expect(selector).toBeVisible({ timeout })
    } catch (error) {
      console.log(`Элемент не найден: ${selector}`)
      console.log('Текущий URL:', this.page.url())
      
      // Логируем все кнопки на странице для отладки
      const buttons = await this.page.$$('button')
      console.log(`На странице найдено ${buttons.length} кнопок:`)
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i]
        const text = await button.textContent()
        console.log(`  Кнопка ${i}: "${text?.trim()}"`)
      }
      
      await this.page.screenshot({ path: `/project/debug-error-${Date.now()}.png` })
      throw error
    }
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