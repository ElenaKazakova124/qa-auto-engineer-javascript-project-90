// tests/pages/UsersPage.js
import BasePage from './BasePage.js'

class UsersPage extends BasePage {
  constructor(page) {
    super(page)
    this.createButton = page.locator('button:has-text("+ CREATE"), button:has-text("CREATE"), button:has-text("Create"), [aria-label*="create"], [aria-label*="add"]').first()
    this.emailField = page.getByLabel('Email*')
    this.firstNameField = page.getByLabel('First Name*')
    this.lastNameField = page.getByLabel('Last Name*')
    this.saveButton = page.locator('button:has-text("SAVE"), button[type="submit"]').first()
  }

  async waitForPageLoaded() {
    await Promise.race([
      this.createButton.waitFor({ state: 'visible', timeout: 20000 }),
      this.page.locator('button:has-text("Export")').waitFor({ state: 'visible', timeout: 20000 }),
      this.page.locator('h2:has-text("Users")').waitFor({ state: 'visible', timeout: 20000 })
    ])
  }

  async clickCreate() {
    await this.click(this.createButton)
    await this.waitForPageLoad()
  }

  async fillUserForm(email, firstName, lastName) {
    await this.fill(this.emailField, email)
    await this.fill(this.firstNameField, firstName)
    await this.fill(this.lastNameField, lastName)
  }

  async clickSave() {
    await this.click(this.saveButton)
    await this.waitForPageLoad()
  }

  async createUser(email, firstName, lastName) {
    await this.clickCreate()
    await this.fillUserForm(email, firstName, lastName)
    await this.clickSave()
  }

  async editUser(oldEmail, newEmail, firstName, lastName) {
    await this.helpers.clickEdit(this.page, oldEmail)
    await this.fillUserForm(newEmail, firstName, lastName)
    await this.clickSave()
  }

  async deleteUser(email) {
    await this.helpers.clickDelete(this.page, email)
    await this.helpers.clickConfirm(this.page)
  }
}

export default UsersPage