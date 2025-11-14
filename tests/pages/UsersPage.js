import BasePage from './BasePage.js'

class UsersPage extends BasePage {
  constructor(page) {
    super(page)
    this.createButton = page.locator('button:has-text("Create")')
    this.emailField = page.getByLabel('Email')
    this.firstNameField = page.getByLabel('First Name')
    this.lastNameField = page.getByLabel('Last Name')
    this.saveButton = page.locator('button:has-text("Save")')
    this.pageTitle = page.locator('h1, h2, h3').filter({ hasText: /Users?/i })
  }

  async waitForPageLoaded() {
    await this.helpers.diagnosePageState(this.page, 'UsersPage')
    
    await Promise.race([
      this.pageTitle.waitFor({ state: 'visible', timeout: 15000 }),
      this.createButton.waitFor({ state: 'visible', timeout: 15000 }),
      this.page.locator('button:has-text("Export")').waitFor({ state: 'visible', timeout: 15000 })
    ])
  }

  async openCreateForm() {
    console.log('Opening create form for users...')
    await this.helpers.clickCreate(this.page)
    await this.waitForElement(this.emailField, 10000)
  }

  async fillUserForm(email, firstName, lastName) {
    await this.fill(this.emailField, email)
    await this.fill(this.firstNameField, firstName)
    await this.fill(this.lastNameField, lastName)
  }

  async saveForm() {
    await this.helpers.clickSave(this.page)
  }

  async createUser(email, firstName, lastName) {
    await this.openCreateForm()
    await this.fillUserForm(email, firstName, lastName)
    await this.saveForm()
  }

  async editUser(oldEmail, newEmail, firstName, lastName) {
    await this.helpers.clickEdit(this.page, oldEmail)
    await this.fillUserForm(newEmail, firstName, lastName)
    await this.saveForm()
  }

  async deleteUser(email) {
    await this.helpers.clickDelete(this.page, email)
    await this.helpers.clickConfirm(this.page)
  }
}

export default UsersPage