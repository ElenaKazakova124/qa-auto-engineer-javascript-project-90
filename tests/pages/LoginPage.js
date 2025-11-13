import BasePage from './BasePage.js'
import constants from '../utils/constants.js'

class LoginPage extends BasePage {
    constructor(page) {
        super(page)
        this.constants = constants
        this.usernameField = page.getByLabel(constants.authElements.usernameLabel)
        this.passwordField = page.getByLabel(constants.authElements.passwordLabel)
        this.signInButton = page.getByRole('button', { name: constants.authElements.signInButton })
    }

    async goto() {
        await this.page.goto('/')
        await this.page.waitForLoadState('networkidle')
        await this.waitForPageLoaded()
    }

    async waitForPageLoaded() {
        await this.waitForElement(this.usernameField)
    }

    async login(username = 'admin', password = 'admin') {
        await this.fill(this.usernameField, username)
        await this.fill(this.passwordField, password)
        await this.click(this.signInButton)
        await this.page.waitForLoadState('networkidle')
    }
}

export default LoginPage