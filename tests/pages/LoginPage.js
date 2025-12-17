import BasePage from './BasePage.js';
import constants from '../utils/constants.js';

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameInput = page.locator('input[type="text"]').first();
    this.passwordInput = page.locator('input[type="password"]').first();
    this.signInButton = page.getByRole('button', { name: constants.authElements.signInButton });
    this.errorMessage = page.locator('.error, .Mui-error, [role="alert"]').first();
  }

  async goto() {
    try {
      await this.page.goto('/login');
      await this.page.waitForLoadState('networkidle');
      return true;
    } catch (_error) {
      return false;
    }
  }

  async login(username = 'admin', password = 'admin') {
    try {
      await this.goto();
      await this.page.waitForLoadState('networkidle');
      await this.usernameInput.fill(username);
      await this.passwordInput.fill(password);
      await this.signInButton.click();
      await this.page.waitForLoadState('networkidle');
      
      try {
        const dashboardTitle = this.page.locator('text=Welcome to the administration').first();
        if (await dashboardTitle.isVisible({ timeout: 10000 })) {
          return true;
        }
      } catch (_error) {
      }
      
      const currentUrl = this.page.url();
      if (currentUrl.includes('/dashboard') || currentUrl.includes('/#/dashboard') || !currentUrl.includes('/login')) {
        return true;
      }
      
      return false;
    } catch (_error) {
      return false;
    }
  }
}

export default LoginPage;