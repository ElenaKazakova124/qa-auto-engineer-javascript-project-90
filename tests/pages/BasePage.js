import helpers from '../utils/helpers.js';

class BasePage {
  constructor(page) {
    this.page = page;
  }

  async waitForElement(selector, timeout = 15000) {
    if (typeof selector === 'string') {
      await this.page.waitForSelector(selector, { state: 'visible', timeout });
      return;
    }
    await selector.waitFor({ state: 'visible', timeout });
  }

  async click(selector, timeout = 15000) {
    await this.waitForElement(selector, timeout);
    if (typeof selector === 'string') {
      await this.page.click(selector);
    } else {
      await selector.click();
    }
    await this.page.waitForLoadState('domcontentloaded');
  }

  async fill(selector, text, timeout = 15000) {
    await this.waitForElement(selector, timeout);
    if (typeof selector === 'string') {
      await this.page.fill(selector, text);
    } else {
      await selector.fill(text);
    }
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateTo(url) {
    await this.page.goto(url);
    await helpers.waitForPageLoad(this.page);
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
    if (typeof selector === 'string') {
      return await this.page.locator(selector).first().isVisible({ timeout });
    }
    return await selector.isVisible({ timeout });
  }

  async selectOption(selector, value) {
    await this.waitForElement(selector);
    if (typeof selector === 'string') {
      await this.page.selectOption(selector, value);
    } else {
      await selector.selectOption(value);
    }
    await this.page.waitForLoadState('domcontentloaded');
  }

  async check(selector) {
    await this.waitForElement(selector);
    if (typeof selector === 'string') {
      await this.page.check(selector);
    } else {
      await selector.check();
    }
    await this.page.waitForLoadState('domcontentloaded');
  }

  async uncheck(selector) {
    await this.waitForElement(selector);
    if (typeof selector === 'string') {
      await this.page.uncheck(selector);
    } else {
      await selector.uncheck();
    }
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getValue(selector) {
    await this.waitForElement(selector);
    if (typeof selector === 'string') {
      return await this.page.inputValue(selector);
    } else {
      return await selector.inputValue();
    }
  }

  async getAttribute(selector, attribute) {
    await this.waitForElement(selector);
    if (typeof selector === 'string') {
      return await this.page.getAttribute(selector, attribute);
    } else {
      return await selector.getAttribute(attribute);
    }
  }

  async waitForTimeout(ms) {
    await this.page.waitForTimeout(ms);
  }

  async takeScreenshot(name) {
    const timestamp = Date.now();
    const screenshotName = `screenshot-${name}-${timestamp}.png`;
    await this.page.screenshot({ path: screenshotName, fullPage: true });
    return screenshotName;
  }

  async waitForUrl(urlPattern, timeout = 10000) {
    await this.page.waitForURL(urlPattern, { timeout });
  }

  async reload() {
    await this.page.reload();
    await helpers.waitForPageLoad(this.page);
  }

  async goBack() {
    await this.page.goBack();
    await helpers.waitForPageLoad(this.page);
  }

  async goForward() {
    await this.page.goForward();
    await helpers.waitForPageLoad(this.page);
  }

  async pressKey(key) {
    await this.page.keyboard.press(key);
  }

  async type(selector, text, options = {}) {
    await this.waitForElement(selector);
    if (typeof selector === 'string') {
      await this.page.type(selector, text, options);
    } else {
      await selector.type(text, options);
    }
  }

  async clear(selector) {
    await this.waitForElement(selector);
    if (typeof selector === 'string') {
      await this.page.fill(selector, '');
    } else {
      await selector.fill('');
    }
  }

  async dragAndDrop(source, target) {
    await this.waitForElement(source);
    await this.waitForElement(target);
    await source.dragTo(target);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async hover(selector) {
    await this.waitForElement(selector);
    if (typeof selector === 'string') {
      await this.page.hover(selector);
    } else {
      await selector.hover();
    }
    await this.page.waitForLoadState('domcontentloaded');
  }

  async rightClick(selector) {
    await this.waitForElement(selector);
    if (typeof selector === 'string') {
      await this.page.click(selector, { button: 'right' });
    } else {
      await selector.click({ button: 'right' });
    }
    await this.page.waitForLoadState('domcontentloaded');
  }

  async doubleClick(selector) {
    await this.waitForElement(selector);
    if (typeof selector === 'string') {
      await this.page.dblclick(selector);
    } else {
      await selector.dblclick();
    }
    await this.page.waitForLoadState('domcontentloaded');
  }

  async focus(selector) {
    await this.waitForElement(selector);
    if (typeof selector === 'string') {
      await this.page.focus(selector);
    } else {
      await selector.focus();
    }
  }

  async blur(selector) {
    await this.focus(selector);
    await this.page.evaluate(() => document.activeElement.blur());
  }

  async evaluateFunction(func, arg) {
    return await this.page.evaluate(func, arg);
  }

  async getPageTitle() {
    return await this.page.title();
  }

  async getPageUrl() {
    return this.page.url();
  }

  async waitForNavigation(timeout = 10000) {
    await this.page.waitForNavigation({ timeout });
  }
}

export default BasePage;