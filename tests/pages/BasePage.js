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
      
      const buttons = await this.page.$$('button')
      console.log(`На странице найдено ${buttons.length} кнопок:`)
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i]
        const text = await button.textContent()
        console.log(`  Кнопка ${i}: "${text?.trim()}"`)
      }
      
      throw error
    }
  }

  async click(selector) {
    await this.waitForElement(selector)
    await selector.click()
  }

  async fill(selector, value) {
    await this.waitForElement(selector)
    await selector.fill(value)
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
  }
}

export default BasePage