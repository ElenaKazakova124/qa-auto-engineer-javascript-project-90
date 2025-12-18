import BasePage from './BasePage.js';
import constants from '../utils/constants.js';

class AppPage extends BasePage {
  constructor(page) {
    super(page);
  }

  get signInButton() {
    return this.page.getByRole('button', { name: /sign in/i });
  }

  get welcomeText() {
    return this.page.getByText(constants.mainPageElements.welcomeText);
  }

  async waitForAppLoad(timeout = 15000) {
    await Promise.race([
      this.signInButton.waitFor({ state: 'visible', timeout }),
      this.welcomeText.waitFor({ state: 'visible', timeout })
    ]);
  }

  async isAppLoaded() {
    return (
      await this.signInButton.isVisible().catch(() => false) ||
      await this.welcomeText.isVisible().catch(() => false)
    );
  }
}

export default AppPage;