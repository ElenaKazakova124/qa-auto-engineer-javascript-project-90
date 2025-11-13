import BasePage from './BasePage'

class UsersPage extends BasePage {
  constructor(page) {
    super(page)
    this.header = page.getByRole('heading', { name: 'Users' })
    this.createButton = page.getByRole('button', { name: 'CREATE' })
    this.saveButton = page.getByRole('button', { name: 'SAVE' })
    this.emailInput = page.getByLabel('Email*')
    this.firstNameInput = page.getByLabel('First name*')
    this.lastNameInput = page.getByLabel('Last name*')
  }

  async waitForPageLoaded() {
    await this.waitForElement(this.header)
    await this.waitForElement(this.createButton)
  }

  async createUser(email, firstName, lastName) {
    await this.click(this.createButton)
    await this.fill(this.emailInput, email)
    await this.fill(this.firstNameInput, firstName)
    await this.fill(this.lastNameInput, lastName)
    await this.click(this.saveButton)
  }

  async editUser(oldEmail, newEmail, newFirstName, newLastName) {
    await this.clickEditButton(oldEmail)
    await this.fill(this.emailInput, newEmail)
    await this.fill(this.firstNameInput, newFirstName)
    await this.fill(this.lastNameInput, newLastName)
    await this.click(this.saveButton)
  }

  async clickEditButton(email) {
    const row = this.page.locator('tr', { has: this.page.getByText(email) })
    await row.getByRole('button', { name: 'EDIT' }).first().click()
  }

  async deleteUser(email) {
    await this.clickDeleteButton(email)
    await this.helpers.clickConfirm(this.page)
  }

  async clickDeleteButton(email) {
    const row = this.page.locator('tr', { has: this.page.getByText(email) })
    await row.getByRole('button', { name: 'Delete' }).click()
  }

  async verifyUsersTable() {
    const rows = await this.helpers.getRowCount(this.page)
    if (rows === 0) {
      await this.shouldSee('john@google.com')
    }
  }
}

export default UsersPage