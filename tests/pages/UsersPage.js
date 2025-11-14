import BasePage from './BasePage.js'

class UsersPage extends BasePage {
  constructor(page) {
    super(page)
    this.createButton = page.locator('button:has-text("+ CREATE")')
    this.emailField = page.getByLabel('Email*')
    this.firstNameField = page.getByLabel('First Name*')
    this.lastNameField = page.getByLabel('Last Name*')
    this.saveButton = page.locator('button:has-text("SAVE"), button[type="submit"]').first()
  }

  async waitForPageLoaded() {
    await this.waitForElement(this.createButton)
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