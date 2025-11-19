import BasePage from './BasePage.js';
import constants from '../utils/constants.js';

class UsersPage extends BasePage {
  constructor(page) {
    super(page);
    this.createButton = this.page.locator(`a:has-text("${constants.tableElements.createButton}")`).first();
    this.emailInput = this.page.locator('input[name="email"]').first();
    this.firstNameInput = this.page.locator('input[name="firstName"]').first();
    this.lastNameInput = this.page.locator('input[name="lastName"]').first();
    this.saveButton = this.page.locator(`button:has-text("${constants.tableElements.saveButton}")`).first();
    this.usersLink = this.page.locator(`a:has-text("${constants.mainPageElements.usersMenuItemLabel}")`).first();
  }

  async goto() {
    await this.click(this.usersLink);
    await this.page.waitForURL('**/users');
    console.log('Users page loaded successfully');
  }

  async openCreateForm() {
    console.log('Opening create form for users...');
    await this.click(this.createButton);
  }

  async createUser(email = null, firstName = null, lastName = null) {
    const userEmail = email || `testuser${Date.now()}@example.com`;
    const userFirstName = firstName || `TestFirstName${Date.now()}`;
    const userLastName = lastName || `TestLastName${Date.now()}`;
    await this.openCreateForm();
    await this.fill(this.emailInput, userEmail);
    await this.fill(this.firstNameInput, userFirstName);
    await this.fill(this.lastNameInput, userLastName);
    await this.click(this.saveButton);
    
    return userEmail;
  }
}

export default UsersPage;