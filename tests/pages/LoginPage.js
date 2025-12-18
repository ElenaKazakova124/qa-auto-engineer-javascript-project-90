import BasePage from './BasePage.js';
import constants from '../utils/constants.js';

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameInput = page.locator('input[type="text"]').first();
    this.passwordInput = page.locator('input[type="password"]').first();
    this.signInButton = page.getByRole('button', { name: /sign in/i });
    this.errorMessage = page.locator('.error, .Mui-error, [role="alert"]').first();
  }

  async goto() {
    try {
      await this.page.goto('/login');
      await this.page.waitForLoadState('domcontentloaded');
      return true;
    } catch (_error) {
      return false;
    }
  }

  async login(username = 'admin', password = 'admin') {
    try {
      // If already logged in (not on /login and no sign-in button), do nothing.
      const signInVisible = await this.signInButton.isVisible({ timeout: 1000 }).catch(() => false);
      const welcomeVisible = await this.page
        .getByText(constants.mainPageElements.welcomeText)
        .isVisible({ timeout: 1000 })
        .catch(() => false);

      if (!signInVisible && welcomeVisible) {
        return true;
      }

      await this.goto();
      await this.page.waitForLoadState('domcontentloaded');
      await this.usernameInput.fill(username);
      await this.passwordInput.fill(password);
      await this.signInButton.click();

      const dashboardLink = this.page.locator(`a:has-text("${constants.mainPageElements.dashboardMenuItemLabel}")`).first();

      // Wait until we either see the welcome text or a logged-in navigation element
      await Promise.race([
        this.page.getByText(constants.mainPageElements.welcomeText).waitFor({ state: 'visible', timeout: 15000 }),
        dashboardLink.waitFor({ state: 'visible', timeout: 15000 }),
      ]).catch(() => null);

      // Deterministic final check
      const isWelcomeVisible = await this.page
        .getByText(constants.mainPageElements.welcomeText)
        .isVisible({ timeout: 1000 })
        .catch(() => false);
      const isDashboardVisible = await dashboardLink.isVisible({ timeout: 1000 }).catch(() => false);

      return isWelcomeVisible || isDashboardVisible;
    } catch (_error) {
      return false;
    }
  }
}

export default LoginPage;