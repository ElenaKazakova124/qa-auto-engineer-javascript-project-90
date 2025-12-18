import { expect } from '@playwright/test';
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
    await Promise.any([
      expect(this.signInButton).toBeVisible({ timeout }),
      expect(this.usernameField).toBeVisible({ timeout }),
      expect(this.usernameText).toBeVisible({ timeout }),
      expect(this.passwordText).toBeVisible({ timeout }),
      expect(this.loginRequiredAlert).toBeVisible({ timeout }),
      expect(this.welcomeText).toBeVisible({ timeout }),
      expect(this.dashboardLink).toBeVisible({ timeout }),
      expect(this.profileButton).toBeVisible({ timeout }),
      expect(this.page.locator('body')).toBeAttached({ timeout }),
      expect(this.page.locator('#root')).toBeAttached({ timeout }),
    ]);
  }

  async isAppLoaded() {
    await Promise.any([
      expect(this.signInButton).toBeVisible({ timeout: 15000 }),
      expect(this.usernameField).toBeVisible({ timeout: 15000 }),
      expect(this.usernameText).toBeVisible({ timeout: 15000 }),
      expect(this.passwordText).toBeVisible({ timeout: 15000 }),
      expect(this.loginRequiredAlert).toBeVisible({ timeout: 15000 }),
      expect(this.welcomeText).toBeVisible({ timeout: 15000 }),
      expect(this.dashboardLink).toBeVisible({ timeout: 15000 }),
      expect(this.profileButton).toBeVisible({ timeout: 15000 }),
    ]);
    return true;
  }
}

export default AppPage;