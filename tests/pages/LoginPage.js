import BasePage from './BasePage'

class LoginPage extends BasePage {
  constructor(page) {
    super(page)
    this.usernameInput = page.getByLabel('Username*')
    this.passwordInput = page.getByLabel('Password*')
    this.signInButton = page.getByRole('button', { name: 'SIGN IN' })
  }

  async goto() {
    await this.page.goto('/')
    await this.waitForPageLoaded()
  }

  async waitForPageLoaded() {
    await this.waitForElement(this.usernameInput)
  }

  async login(username, password) {
    await this.helpers.login(this.page, username, password)
  }
}

export default LoginPage