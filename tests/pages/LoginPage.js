import BasePage from './BasePage.js';
import constants from '../utils/constants.js';

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameInput = this.page.getByLabel(constants.authElements.usernameLabel);
    this.passwordInput = this.page.getByLabel(constants.authElements.passwordLabel);
    this.signInButton = this.page.getByRole('button', { name: constants.authElements.signInButton });
  }

  async goto() {
    await this.page.goto('http://localhost:5173/');
  }

  async login(username = 'admin', password = 'admin') {
    await this.goto();
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.click(this.signInButton);
  }
}

export default LoginPage;