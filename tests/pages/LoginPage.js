const { expect } = require('@playwright/test')
const { authElements } = require('../utils/constants.js')

class LoginPage {
  constructor(page) {
    this.page = page
    this.usernameInput = page.getByLabel(authElements.usernameLabel)
    this.passwordInput = page.getByLabel(authElements.passwordLabel)
    this.signInButton = page.getByRole('button', { name: authElements.signInButton })
    this.errorMessage = page.locator('.error-message')
  }

  async goto() {
    await this.page.goto('/')
    await this.waitForPageLoaded()
  }

  async waitForPageLoaded() {
    await expect(this.usernameInput).toBeVisible()
    await expect(this.passwordInput).toBeVisible()
    await expect(this.signInButton).toBeVisible()
  }

  async fillCredentials(username, password) {
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)
  }

  async submit() {
    await this.signInButton.click()
  }

  async login(username, password) {
    await this.fillCredentials(username, password)
    await this.submit()
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent()
  }

  async isLoginFormVisible() {
    return await this.usernameInput.isVisible() && 
           await this.passwordInput.isVisible() && 
           await this.signInButton.isVisible()
  }
}

module.exports = LoginPage