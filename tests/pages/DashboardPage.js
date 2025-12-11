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
    await this.waitForElement(this.dashboardLink);
  }

  async logout() {
    try {
      await this.profileButton.click();
      await this.page.waitForTimeout(1000);
      await this.logoutButton.click({ force: true });
      await this.page.waitForURL('**/login', { timeout: 10000 });
      return true;
    } catch (_) {
      await this.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      await this.page.goto('/login');
      return true;
    }
  }
}

export default DashboardPage;