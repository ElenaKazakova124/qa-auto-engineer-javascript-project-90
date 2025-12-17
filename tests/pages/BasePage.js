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
      return true;
    } catch (_error) {
      return false;
    }
  }

  async click(selector, timeout = 30000) {
    const isVisible = await this.waitForElement(selector, timeout);
    if (!isVisible) {
      throw new Error(`Element not visible for clicking: ${selector}`);
    }
    if (typeof selector === 'string') {
      await this.page.click(selector);
    } else {
      await selector.click();
    }
    await this.page.waitForLoadState('domcontentloaded').catch(() => null);
  }

  async fill(selector, text, timeout = 30000) {
    const isVisible = await this.waitForElement(selector, timeout);
    if (!isVisible) {
      throw new Error(`Element not visible for filling: ${selector}`);
    }
    if (typeof selector === 'string') {
      await this.page.fill(selector, text);
    } else {
      await selector.fill(text);
    }
    await this.page.waitForLoadState('domcontentloaded').catch(() => null);
  }

  async navigateTo(url) {
    await this.page.goto(url);
    await helpers.waitForPageLoad(this.page);
  }

  async getText(selector) {
    const isVisible = await this.waitForElement(selector);
    if (!isVisible) {
      throw new Error(`Element not visible for getting text: ${selector}`);
    }
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

  async selectOption(selector, value) {
    const isVisible = await this.waitForElement(selector);
    if (!isVisible) {
      throw new Error(`Element not visible for selecting option: ${selector}`);
    }
    if (typeof selector === 'string') {
      await this.page.selectOption(selector, value);
    } else {
      await selector.selectOption(value);
    }
    await this.page.waitForLoadState('domcontentloaded').catch(() => null);
  }

  async check(selector) {
    const isVisible = await this.waitForElement(selector);
    if (!isVisible) {
      throw new Error(`Element not visible for checking: ${selector}`);
    }
    if (typeof selector === 'string') {
      await this.page.check(selector);
    } else {
      await selector.check();
    }
    await this.page.waitForLoadState('domcontentloaded').catch(() => null);
  }

  async uncheck(selector) {
    const isVisible = await this.waitForElement(selector);
    if (!isVisible) {
      throw new Error(`Element not visible for unchecking: ${selector}`);
    }
    if (typeof selector === 'string') {
      await this.page.uncheck(selector);
    } else {
      await selector.uncheck();
    }
    await this.page.waitForLoadState('domcontentloaded').catch(() => null);
  }

  async getValue(selector) {
    const isVisible = await this.waitForElement(selector);
    if (!isVisible) {
      throw new Error(`Element not visible for getting value: ${selector}`);
    }
    if (typeof selector === 'string') {
      return await this.page.inputValue(selector);
    } else {
      return await selector.inputValue();
    }
  }

  async getAttribute(selector, attribute) {
    const isVisible = await this.waitForElement(selector);
    if (!isVisible) {
      throw new Error(`Element not visible for getting attribute: ${selector}`);
    }
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
    const isVisible = await this.waitForElement(selector);
    if (!isVisible) {
      throw new Error(`Element not visible for typing: ${selector}`);
    }
    if (typeof selector === 'string') {
      await this.page.type(selector, text, options);
    } else {
      await selector.type(text, options);
    }
  }

  async clear(selector) {
    const isVisible = await this.waitForElement(selector);
    if (!isVisible) {
      throw new Error(`Element not visible for clearing: ${selector}`);
    }
    if (typeof selector === 'string') {
      await this.page.fill(selector, '');
    } else {
      await selector.fill('');
    }
  }

  async dragAndDrop(source, target) {
    const isSourceVisible = await this.waitForElement(source);
    const isTargetVisible = await this.waitForElement(target);
    if (!isSourceVisible || !isTargetVisible) {
      throw new Error('Source or target element not visible for drag and drop');
    }
    await source.dragTo(target);
    await this.page.waitForLoadState('networkidle').catch(() => null);
  }

  async hover(selector) {
    const isVisible = await this.waitForElement(selector);
    if (!isVisible) {
      throw new Error(`Element not visible for hovering: ${selector}`);
    }
    if (typeof selector === 'string') {
      await this.page.hover(selector);
    } else {
      await selector.hover();
    }
    await this.page.waitForLoadState('domcontentloaded').catch(() => null);
  }

  async rightClick(selector) {
    const isVisible = await this.waitForElement(selector);
    if (!isVisible) {
      throw new Error(`Element not visible for right clicking: ${selector}`);
    }
    if (typeof selector === 'string') {
      await this.page.click(selector, { button: 'right' });
    } else {
      await selector.click({ button: 'right' });
    }
    await this.page.waitForLoadState('domcontentloaded').catch(() => null);
  }

  async doubleClick(selector) {
    const isVisible = await this.waitForElement(selector);
    if (!isVisible) {
      throw new Error(`Element not visible for double clicking: ${selector}`);
    }
    if (typeof selector === 'string') {
      await this.page.dblclick(selector);
    } else {
      await selector.dblclick();
    }
    await this.page.waitForLoadState('domcontentloaded').catch(() => null);
  }

  async focus(selector) {
    const isVisible = await this.waitForElement(selector);
    if (!isVisible) {
      throw new Error(`Element not visible for focusing: ${selector}`);
    }
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