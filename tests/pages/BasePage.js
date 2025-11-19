import { expect } from '@playwright/test';
import Helpers from '../utils/helpers.js';

class BasePage {
  constructor(page) {
    this.page = page;
  }

  async waitForElement(selector, timeout = 30000) {
    try {
      await expect(selector).toBeVisible({ timeout });
    } catch (error) {
      console.log(`Элемент не найден: ${selector}`);
      console.log('Текущий URL:', this.page.url());
      await Helpers.diagnosePageState(this.page, 'element-not-found');
      throw error;
    }
  }

  async click(selector, timeout = 30000) {
    await this.waitForElement(selector, timeout);
    await selector.click();
  }

  async fill(selector, text, timeout = 30000) {
    await this.waitForElement(selector, timeout);
    await selector.fill(text);
  }

  async navigateTo(url) {
    await this.page.goto(url);
  }

  async getText(selector) {
    await this.waitForElement(selector);
    return await selector.textContent();
  }

  async isElementVisible(selector, timeout = 5000) {
    try {
      await this.waitForElement(selector, timeout);
      return true;
    } catch {
      return false;
    }
  }
}

export default BasePage;