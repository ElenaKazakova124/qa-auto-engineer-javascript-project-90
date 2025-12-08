import helpers from '../utils/helpers.js';

class BasePage {
  constructor(page) {
    this.page = page;
  }

  async waitForElement(selector, timeout = 30000) {
    try {
      if (typeof selector === 'string') {
        await this.page.waitForSelector(selector, { state: 'visible', timeout });
      } else {
        await selector.waitFor({ state: 'visible', timeout });
      }
    } catch (error) {
      console.log(`Элемент не найден: ${selector}`);
      console.log('Текущий URL:', this.page.url());
      await helpers.diagnosePageState(this.page, 'element-not-found');
      throw error;
    }
  }

  async click(selector, timeout = 30000) {
    await this.waitForElement(selector, timeout);
    if (typeof selector === 'string') {
      await this.page.click(selector);
    } else {
      await selector.click();
    }
  }

  async fill(selector, text, timeout = 30000) {
    await this.waitForElement(selector, timeout);
    if (typeof selector === 'string') {
      await this.page.fill(selector, text);
    } else {
      await selector.fill(text);
    }
  }

  async navigateTo(url) {
    await this.page.goto(url);
  }

  async getText(selector) {
    await this.waitForElement(selector);
    if (typeof selector === 'string') {
      return await this.page.textContent(selector);
    } else {
      return await selector.textContent();
    }
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