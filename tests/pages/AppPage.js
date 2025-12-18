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

  get dashboardLink() {
    return this.page.locator(`a:has-text("${constants.mainPageElements.dashboardMenuItemLabel}")`).first();
  }

  get profileButton() {
    return this.page.getByRole('button', { name: /jane doe|profile/i }).first();
  }

  get usernameField() {
    return this.page.getByLabel(constants.authElements.usernameLabel);
  }

  get usernameText() {
    return this.page.getByText(new RegExp(constants.authElements.usernameLabel, 'i')).first();
  }

  get passwordText() {
    return this.page.getByText(new RegExp(constants.authElements.passwordLabel, 'i')).first();
  }

  get loginRequiredAlert() {
    return this.page.locator('[role="alert"]').filter({ hasText: /please login/i }).first();
  }

  async waitForAppLoad(timeout = 15000) {
    try {
      await Promise.any([
        this.signInButton.waitFor({ state: 'visible', timeout }),
        this.usernameField.waitFor({ state: 'visible', timeout }),
        this.usernameText.waitFor({ state: 'visible', timeout }),
        this.passwordText.waitFor({ state: 'visible', timeout }),
        this.loginRequiredAlert.waitFor({ state: 'visible', timeout }),
        this.welcomeText.waitFor({ state: 'visible', timeout }),
        this.dashboardLink.waitFor({ state: 'visible', timeout }),
        this.profileButton.waitFor({ state: 'visible', timeout }),
        this.page.locator('body').waitFor({ state: 'attached', timeout }),
        this.page.locator('#root').waitFor({ state: 'attached', timeout }),
      ]);
    } catch (_error) {
      const url = this.page.url();
      const title = await this.page.title().catch(() => '');
      const bodyText = await this.page.textContent('body').catch(() => '');
      const snippet = (bodyText || '').replace(/\s+/g, ' ').slice(0, 200);
      throw new Error(`App did not reach a known stable UI state in ${timeout}ms. url="${url}" title="${title}" bodySnippet="${snippet}"`);
    }
  }

  async isAppLoaded() {
    return (
      await this.signInButton.isVisible().catch(() => false) ||
      await this.usernameField.isVisible().catch(() => false) ||
      await this.usernameText.isVisible().catch(() => false) ||
      await this.passwordText.isVisible().catch(() => false) ||
      await this.loginRequiredAlert.isVisible().catch(() => false) ||
      await this.welcomeText.isVisible().catch(() => false) ||
      await this.dashboardLink.isVisible().catch(() => false) ||
      await this.profileButton.isVisible().catch(() => false)
    );
  }
}

export default AppPage;