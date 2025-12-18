import { expect } from '@playwright/test';
import BasePage from './BasePage.js';
import constants from '../utils/constants.js';

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameInput = page.locator('input[name="username"], input[placeholder*="Username"], input[type="text"]').first();
    this.passwordInput = page.locator('input[name="password"], input[placeholder*="Password"], input[type="password"]').first();
    this.signInButton = page.getByRole('button', { name: /sign in/i });
    this.errorMessage = page.locator('.error, .Mui-error, [role="alert"]').first();
  }

  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.signInButton).toBeVisible({ timeout: 15000 });
    return true;
  }

  async login(username = 'admin', password = 'admin') {
    await this.goto();
    const usernameField = this.page.getByLabel(/username/i).first();
    const passwordField = this.page.getByLabel(/password/i).first();
    await expect(usernameField).toBeVisible({ timeout: 15000 });
    await expect(passwordField).toBeVisible({ timeout: 15000 });
    await usernameField.fill(username);
    await passwordField.fill(password);
    await expect(this.signInButton).toBeVisible({ timeout: 15000 });
    await this.signInButton.click();
    const dashboardLink = this.page.locator(`a:has-text("${constants.mainPageElements.dashboardMenuItemLabel}")`).first();
    await Promise.any([
      this.page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 }),
      dashboardLink.waitFor({ state: 'visible', timeout: 15000 }),
      this.page.getByText(constants.mainPageElements.welcomeText).waitFor({ state: 'visible', timeout: 15000 }),
    ]);
    return true;
  }
}

export default LoginPage;