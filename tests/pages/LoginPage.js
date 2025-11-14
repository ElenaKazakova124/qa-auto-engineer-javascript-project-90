import BasePage from './BasePage.js'

class LoginPage extends BasePage {
  constructor(page) {
    super(page)
    this.usernameField = page.locator('input[name="username"]')
    this.passwordField = page.locator('input[name="password"]')
    this.signInButton = page.getByRole('button', { name: 'Sign in' })
  }

  async goto() {
    await this.page.goto('http://localhost:5173') 
    await this.waitForPageLoad()
    await this.waitForPageLoaded()
  }

  async waitForPageLoaded() {
    try {
      await this.usernameField.waitFor({ state: 'visible', timeout: 10000 })
    } catch (error) {
      const alternativeUsername = this.page.locator('input[type="text"]').first()
      await alternativeUsername.waitFor({ state: 'visible', timeout: 10000 })
    }
  }

  async login(username = 'admin', password = 'admin') {
    if (!await this.usernameField.isVisible()) {
      this.usernameField = this.page.locator('input[type="text"]').first()
    }
    
    if (!await this.passwordField.isVisible()) {
      this.passwordField = this.page.locator('input[type="password"]').first()
    }

    await this.fill(this.usernameField, username)
    await this.fill(this.passwordField, password)
    await this.click(this.signInButton)
    await this.waitForPageLoad()
  }
}

export default LoginPage