import BasePage from './BasePage.js'

class LoginPage extends BasePage {
  constructor(page) {
    super(page)
    this.usernameField = page.getByLabel('Username*')
    this.passwordField = page.getByLabel('Password*')
    this.signInButton = page.getByRole('button', { name: 'Sign in' })
  }

  async goto() {
    await this.page.goto('/')
    await this.waitForPageLoad()
    await this.waitForPageLoaded()
  }

  async waitForPageLoaded() {
    await this.waitForElement(this.usernameField)
  }

  async login(username = 'admin', password = 'admin') {
    await this.fill(this.usernameField, username)
    await this.fill(this.passwordField, password)
    await this.click(this.signInButton)
    await this.waitForPageLoad()
  }
}

export default LoginPage