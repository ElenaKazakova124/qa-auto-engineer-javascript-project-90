import { expect } from '@playwright/test';
import BasePage from './BasePage.js';
import constants from '../utils/constants.js';

class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.dashboardLink = this.page.locator(`a:has-text("${constants.mainPageElements.dashboardMenuItemLabel}")`).first();
    this.profileButton = this.page.locator(`button:has-text("${constants.mainPageElements.profileButtonLabel}")`).first();
    this.logoutButton = this.page.locator(`text="${constants.mainPageElements.logoutButtonLabel}"`).first();
  }

  async waitForDashboard() {
    await expect(this.dashboardLink).toBeVisible({ timeout: 15000 });
  }

  async logout() {
    await expect(this.profileButton).toBeVisible({ timeout: 15000 });
    await this.profileButton.click();
    await expect(this.logoutButton).toBeVisible({ timeout: 15000 });
    await this.logoutButton.click({ force: true });
    await this.page.waitForURL('**/login', { timeout: 15000 });
    return true;
  }
}

export default DashboardPage;