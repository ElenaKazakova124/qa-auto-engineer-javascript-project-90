import BasePage from './BasePage.js';
import constants from '../utils/constants.js';

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameInput = this.page.getByLabel(constants.authElements.usernameLabel);
    this.passwordInput = this.page.getByLabel(constants.authElements.passwordLabel);
    this.signInButton = this.page.getByRole('button', { name: constants.authElements.signInButton });
    this.errorMessage = this.page.locator('.error, .Mui-error, [role="alert"], .alert-danger, .text-error').first();
  }

  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForLoginForm(timeout = 10000) {
    await this.usernameInput.waitFor({ state: 'visible', timeout });
    await this.passwordInput.waitFor({ state: 'visible', timeout });
    await this.signInButton.waitFor({ state: 'visible', timeout });
  }

  async login(username = 'admin', password = 'admin') {
    await this.waitForLoginForm();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
    
    try {
      await this.page.waitForURL(/.*\/(dashboard|tasks|users|labels|task_statuses)/, { timeout: 10000 });
      return true;
    } catch (_) {
      if (await this.errorMessage.isVisible({ timeout: 3000 })) {
        return false;
      }
      return false;
    }
  }

  async loginWithInvalidCredentials(username = 'invalid', password = 'invalid') {
    await this.waitForLoginForm();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
    
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
      const errorText = await this.errorMessage.textContent();
      return errorText.trim();
    } catch (_) {
      const currentUrl = this.page.url();
      if (currentUrl.includes('/login')) {
        return 'Остались на странице логина';
      }
      return 'Неизвестная ошибка';
    }
  }

  async getErrorMessage() {
    if (await this.errorMessage.isVisible({ timeout: 3000 })) {
      return await this.errorMessage.textContent();
    }
    return null;
  }

  async clearLoginForm() {
    await this.usernameInput.fill('');
    await this.passwordInput.fill('');
  }

  async isLoginFormVisible() {
    const isVisible = await this.usernameInput.isVisible() && 
                     await this.passwordInput.isVisible() &&
                     await this.signInButton.isVisible();
    return isVisible;
  }
}

export default LoginPage;