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
    await this.page.waitForLoadState('domcontentloaded');
  }

  async login(username = 'admin', password = 'admin') {
    console.log('Logging in...');
    
    await this.goto();
  
    await this.usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.click(this.signInButton);
    
    try {
      await this.page.waitForURL('**/#/tasks', { timeout: 10000 });
      console.log('Login successful - redirected to tasks');
    } catch { 
      try {
        await this.page.waitForURL('**/#/dashboard', { timeout: 5000 });
        console.log('Login successful - redirected to dashboard');
      } catch {
        console.log('Login completed - staying on main page');
        await this.page.waitForSelector('a:has-text("Tasks")', { timeout: 5000 });
      }
    }
    
    console.log('Login completed, current URL:', this.page.url());
  }
}

export default LoginPage;