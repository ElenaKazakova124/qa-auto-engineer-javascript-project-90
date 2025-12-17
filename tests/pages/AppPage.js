import BasePage from './BasePage.js';
import constants from '../utils/constants.js';

class AppPage extends BasePage {
  constructor(page) {
    super(page);
  }

  get signInButton() {
    return this.page.getByRole('button', { name: constants.authElements.signInButton });
  }

  get welcomeText() {
    return this.page.locator(`text="${constants.mainPageElements.welcomeText}"`).first();
  }

  async waitForAppLoad(timeout = 15000) {
    await this.page.waitForLoadState('networkidle', { timeout });
    await this.page.waitForSelector('body', { timeout });
    
  }

  async isAppLoaded() {
    try {
      const bodyText = await this.page.textContent('body', { timeout: 3000 });
      return !!bodyText && bodyText.length > 0;
    } catch {
      return false;
    }
  }
}

export default AppPage;