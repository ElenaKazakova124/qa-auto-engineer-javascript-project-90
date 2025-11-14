import BasePage from './BasePage.js'

class UsersPage extends BasePage {
  constructor(page) {
    super(page)
    this.createButton = page.locator('button:has-text("+ CREATE")')
    this.emailField = page.getByLabel('Email *')
    this.firstNameField = page.getByLabel('First name *')
    this.lastNameField = page.getByLabel('Last name *')
    this.saveButton = page.locator('button:has-text("SAVE")')
    this.pageTitle = page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /Users?/i })
  }

  async waitForPageLoaded() {
    await this.waitForElement(this.pageTitle, 15000)
    await this.waitForElement(this.createButton, 10000)
  }

  async openCreateForm() {
    console.log('Opening create form for users...')
    await this.click(this.createButton)
    await this.waitForModal()
    await this.waitForElement(this.emailField, 10000)
  }

  async fillUserForm(email, firstName, lastName) {
    await this.fill(this.emailField, email)
    await this.fill(this.firstNameField, firstName)
    await this.fill(this.lastNameField, lastName)
  }

  async saveForm() {
    await this.click(this.saveButton)
  }

  async createUser(email, firstName, lastName) {
    await this.openCreateForm()
    await this.fillUserForm(email, firstName, lastName)
    await this.saveForm()
  }

  async clickEdit(userEmail) {
    const userRow = this.page.locator('tr', { has: this.page.getByText(userEmail) })
    const editButton = userRow.locator('button:has-text("EDIT")')
    await this.click(editButton)
    await this.waitForModal()
  }

  async clickDelete(userEmail) {
    const userRow = this.page.locator('tr', { has: this.page.getByText(userEmail) })
    const deleteButton = userRow.locator('button:has-text("DELETE")')
    await this.click(deleteButton)
  }
}

export default UsersPage