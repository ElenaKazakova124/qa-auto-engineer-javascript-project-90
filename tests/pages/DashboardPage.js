import BasePage from './BasePage.js';
import constants from '../utils/constants.js';
import helpers from '../utils/helpers.js'

class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.dashboardLink = this.page.locator(`a:has-text("${constants.mainPageElements.dashboardMenuItemLabel}")`).first();
    this.tasksLink = this.page.locator(`a:has-text("${constants.mainPageElements.tasksMenuItemLabel}")`).first();
    this.usersLink = this.page.locator(`a:has-text("${constants.mainPageElements.usersMenuItemLabel}")`).first();
    this.labelsLink = this.page.locator(`a:has-text("${constants.mainPageElements.labelMenuItemLabel}")`).first();
    this.taskStatusesLink = this.page.locator(`a:has-text("${constants.mainPageElements.statusMenuItemLabel}")`).first();
  }

  async waitForDashboard() {
    await this.waitForElement(this.dashboardLink);
    console.log('Dashboard page loaded successfully');
  }

  async goto() {
    await this.click(this.dashboardLink);
  }

  async gotoTasks() {
    await this.click(this.tasksLink);
  }

  async gotoUsers() {
    await this.click(this.usersLink);
  }

  async gotoLabels() {
    await this.click(this.labelsLink);
  }

  async gotoTaskStatuses() {
    await this.click(this.taskStatusesLink);
  }

  async logout() {
    const profileButton = this.page.locator(`button:has-text("${constants.mainPageElements.profileButtonLabel}")`).first();
    await profileButton.click();
    
    await helpers.waitForTimeout(2000);
    
    const logoutButton = this.page.locator(`text=${constants.mainPageElements.logoutButtonLabel}`).first();
    await logoutButton.evaluate(node => node.click());
  }
}

export default DashboardPage;