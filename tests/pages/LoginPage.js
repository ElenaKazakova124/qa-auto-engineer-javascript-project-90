import BasePage from './BasePage.js';
import constants from '../utils/constants.js';

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    // Keep broad fallbacks, but prefer label-based selectors during login.
    this.usernameInput = page.locator('input[name="username"], input[placeholder*="Username"], input[type="text"]').first();
    this.passwordInput = page.locator('input[name="password"], input[placeholder*="Password"], input[type="password"]').first();
    // The app uses "Sign in" (case may vary between environments)
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

      // Labels can differ in casing between implementations/environments
      const usernameField = this.page.getByLabel(/username/i).first();
      const passwordField = this.page.getByLabel(/password/i).first();

      // Fill with robust fallbacks (label-based first, then generic selectors)
      const filledUsername = await usernameField.fill(username).then(() => true).catch(() => false);
      if (!filledUsername) await this.usernameInput.fill(username);

      const filledPassword = await passwordField.fill(password).then(() => true).catch(() => false);
      if (!filledPassword) await this.passwordInput.fill(password);

      await this.signInButton.click();

      const dashboardLink = this.page.locator(`a:has-text("${constants.mainPageElements.dashboardMenuItemLabel}")`).first();

      // Wait until we either navigate away from /login or see a logged-in navigation element / welcome text
      await Promise.any([
        this.page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 }),
        this.page.getByText(constants.mainPageElements.welcomeText).waitFor({ state: 'visible', timeout: 15000 }),
        dashboardLink.waitFor({ state: 'visible', timeout: 15000 }),
      ]).catch(() => null);

      // Deterministic final check
      const isWelcomeVisible = await this.page
        .getByText(constants.mainPageElements.welcomeText)
        .isVisible({ timeout: 1000 })
        .catch(() => false);
      const isDashboardVisible = await dashboardLink.isVisible({ timeout: 1000 }).catch(() => false);

      const currentUrl = this.page.url();
      const isNotOnLogin = !currentUrl.includes('/login');
      const pleaseLoginAlert = this.page.locator('[role="alert"]').filter({ hasText: /please login/i }).first();
      const hasPleaseLogin = await pleaseLoginAlert.isVisible({ timeout: 500 }).catch(() => false);

      // Success if we clearly see app shell OR we left /login and did not get bounced with a "please login" alert.
      return isWelcomeVisible || isDashboardVisible || (isNotOnLogin && !hasPleaseLogin);
    } catch (_error) {
      return false;
    }
  }
}

export default LoginPage;