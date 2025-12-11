import BasePage from './BasePage.js';
import constants from '../utils/constants.js';
import helpers from '../utils/helpers.js';

class UsersPage extends BasePage {
  constructor(page) {
    super(page);
    this.createButton = this.page.locator(`a:has-text("${constants.tableElements.createButton}")`).first();
    this.emailInput = this.page.locator('input[name="email"], input[type="email"]').first();
    this.firstNameInput = this.page.locator('input[name="firstName"], input[name="first_name"]').first();
    this.lastNameInput = this.page.locator('input[name="lastName"], input[name="last_name"]').first();
    this.saveButton = this.page.locator(`button:has-text("${constants.tableElements.saveButton}")`).first();
    this.saveChangesButton = this.page.locator(`button:has-text("${constants.tableElements.saveChangesButton}")`).first();
    this.usersLink = this.page.locator(`a:has-text("${constants.mainPageElements.usersMenuItemLabel}")`).first();
    
    this.tableRows = this.page.locator('tbody tr');
    this.selectAllCheckbox = this.page.locator('thead input[type="checkbox"]').first();
    this.deleteSelectedButton = this.page.locator(`button:has-text("${constants.tableElements.deleteSelected}")`).first();
    this.searchInput = this.page.locator(`input[placeholder*="${constants.tableElements.searchInput}"]`).first();
    
    this.editButtons = this.page.locator(`button:has-text("${constants.tableElements.editButton}")`);
    this.deleteButtons = this.page.locator(`button:has-text("${constants.tableElements.deleteButton}")`);
    this.confirmButton = this.page.locator(`button:has-text("${constants.tableElements.confirmButton}")`).first();
  }

  async goto() {
    await this.click(this.usersLink);
    await this.page.waitForURL('**/users');
  }

  async openCreateForm() {
    await this.click(this.createButton);
    await this.waitForElement(this.emailInput, 5000);
  }

  async createUser(email = null, firstName = null, lastName = null) {
    const userEmail = email || helpers.generateEmail();
    const userFirstName = firstName || helpers.generateName('First');
    const userLastName = lastName || helpers.generateName('Last');
    
    await this.openCreateForm();
    await this.fill(this.emailInput, userEmail);
    await this.fill(this.firstNameInput, userFirstName);
    await this.fill(this.lastNameInput, userLastName);
    await this.click(this.saveButton);
    
    await this.page.waitForURL('**/users', { timeout: 10000 });
    await helpers.waitForPageLoad(this.page);
    
    return { email: userEmail, firstName: userFirstName, lastName: userLastName };
  }

  async editUser(email, newData) {
    const userRow = this.page.locator(`tr:has-text("${email}")`).first();
    
    if (await userRow.isVisible({ timeout: 5000 })) {
      const editButton = userRow.locator(`button:has-text("${constants.tableElements.editButton}")`).first();
      await editButton.click();
      
      await this.waitForElement(this.emailInput, 5000);
      
      if (newData.email) await this.fill(this.emailInput, newData.email);
      if (newData.firstName) await this.fill(this.firstNameInput, newData.firstName);
      if (newData.lastName) await this.fill(this.lastNameInput, newData.lastName);
      
      const saveBtn = this.saveButton.or(this.saveChangesButton).first();
      await saveBtn.click();
      
      await this.page.waitForURL('**/users', { timeout: 10000 });
      await helpers.waitForPageLoad(this.page);
      
      return newData;
    } else {
      throw new Error(`User with email ${email} not found`);
    }
  }

  async deleteUser(email) {
    const userRow = this.page.locator(`tr:has-text("${email}")`).first();
    
    if (await userRow.isVisible({ timeout: 5000 })) {
      const deleteButton = userRow.locator(`button:has-text("${constants.tableElements.deleteButton}")`).first();
      await deleteButton.click();
      
      if (await this.confirmButton.isVisible({ timeout: 3000 })) {
        await this.confirmButton.click();
      }
      
      await this.page.waitForTimeout(2000);
      
      return true;
    } else {
      return false;
    }
  }

  async massDeleteUsers() {
    if (await this.selectAllCheckbox.isVisible({ timeout: 3000 })) {
      await this.selectAllCheckbox.check();
      await helpers.waitForTimeout(1000);
      
      if (await this.deleteSelectedButton.isVisible({ timeout: 3000 })) {
        await this.deleteSelectedButton.click();
        
        if (await this.confirmButton.isVisible({ timeout: 3000 })) {
          await this.confirmButton.click();
          await helpers.waitForTimeout(2000);
        }
      }
    }
  }

  async searchUser(searchText) {
    if (await this.searchInput.isVisible({ timeout: 5000 })) {
      await this.fill(this.searchInput, searchText);
      await this.page.waitForTimeout(1000);
    }
  }

  async getUserCount() {
    return await this.tableRows.count();
  }

  async isUserVisible(email) {
    const userRow = this.page.locator(`tr:has-text("${email}")`).first();
    return await userRow.isVisible({ timeout: 3000 });
  }

  async getAllUsers() {
    const users = [];
    const count = await this.getUserCount();
    
    for (let i = 0; i < count; i++) {
      const row = this.tableRows.nth(i);
      const email = await row.locator('td:nth-child(2)').textContent();
      const firstName = await row.locator('td:nth-child(3)').textContent();
      const lastName = await row.locator('td:nth-child(4)').textContent();
      
      users.push({ email, firstName, lastName });
    }
    
    return users;
  }

  async verifyUserDetails(email, expectedDetails) {
    const userRow = this.page.locator(`tr:has-text("${email}")`).first();
    
    if (await userRow.isVisible({ timeout: 3000 })) {
      const actualEmail = await userRow.locator('td:nth-child(2)').textContent();
      const actualFirstName = await userRow.locator('td:nth-child(3)').textContent();
      const actualLastName = await userRow.locator('td:nth-child(4)').textContent();
      
      return {
        email: actualEmail === expectedDetails.email,
        firstName: actualFirstName === expectedDetails.firstName,
        lastName: actualLastName === expectedDetails.lastName
      };
    }
    
    return null;
  }
}

export default UsersPage;