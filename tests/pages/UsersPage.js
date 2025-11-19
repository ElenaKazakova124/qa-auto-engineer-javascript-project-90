import BasePage from './BasePage.js'

class UsersPage extends BasePage {
  constructor(page) {
    super(page)
    this.createButton = page.locator('button:has-text("Create")')
    this.exportButton = page.locator('button:has-text("Export")')
    this.emailField = page.getByLabel('Email')
    this.firstNameField = page.getByLabel('First name')
    this.lastNameField = page.getByLabel('Last name')
    this.saveButton = page.locator('button:has-text("Save")')
    this.pageTitle = page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /Users?/i })
  }

  async waitForPageLoaded() {
    await Promise.race([
      this.pageTitle.waitFor({ state: 'visible', timeout: 15000 }),
      this.createButton.waitFor({ state: 'visible', timeout: 15000 }),
      this.exportButton.waitFor({ state: 'visible', timeout: 15000 })
    ])
    console.log('Users page loaded successfully')
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
}

export default UsersPage