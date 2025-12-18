import BasePage from './BasePage.js';
import constants from '../utils/constants.js';

class AppPage extends BasePage {
  constructor(page) {
    super(page);
  }

  get signInButton() {
    // "Sign in" label may differ in casing between environments
    return this.page.getByRole('button', { name: /sign in/i });
  }

  get welcomeText() {
    return this.page.getByText(constants.mainPageElements.welcomeText);
  }

  get dashboardLink() {
    return this.page.locator(`a:has-text("${constants.mainPageElements.dashboardMenuItemLabel}")`).first();
  }

  get profileButton() {
    return this.page.getByRole('button', { name: /jane doe|profile/i }).first();
  }

  get usernameField() {
    return this.page.getByLabel(constants.authElements.usernameLabel);
  }

  async waitForAppLoad(timeout = 15000) {
    // IMPORTANT: Use Promise.any (not Promise.race). race rejects as soon as the first awaited
    // promise rejects (e.g. a timeout), which can fail the wait even if other anchors could appear.
    await Promise.any([
      this.signInButton.waitFor({ state: 'visible', timeout }),
      this.usernameField.waitFor({ state: 'visible', timeout }),
      this.welcomeText.waitFor({ state: 'visible', timeout }),
      this.dashboardLink.waitFor({ state: 'visible', timeout }),
      this.profileButton.waitFor({ state: 'visible', timeout }),
    ]);
  }

  async isAppLoaded() {
    return (
      await this.signInButton.isVisible().catch(() => false) ||
      await this.usernameField.isVisible().catch(() => false) ||
      await this.welcomeText.isVisible().catch(() => false) ||
      await this.dashboardLink.isVisible().catch(() => false) ||
      await this.profileButton.isVisible().catch(() => false)
    );
  }
}

export default AppPage;