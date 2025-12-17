import BasePage from './BasePage.js';
import constants from '../utils/constants.js';
import helpers from '../utils/helpers.js';

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameInput = page.locator('input[type="text"]').first();
    this.passwordInput = page.locator('input[type="password"]').first();
    this.signInButton = page.getByRole('button', { name: constants.authElements.signInButton });
    this.errorMessage = page.locator('.error, .Mui-error, [role="alert"]').first();
  }

  async goto() {
    try {
      await this.page.goto('/login');
      await helpers.waitForTimeout(2000);
      return true;
    } catch (error) {
      console.error('Ошибка при переходе на страницу логина:', error);
      return false;
    }
  }

  async login(username = 'admin', password = 'admin') {
    console.log('=== Выполняем вход в систему ===');
    
    try {
      await this.goto();
      await helpers.waitForTimeout(1000);
      await this.usernameInput.fill(username);
      await this.passwordInput.fill(password);
      await this.signInButton.click();
      await helpers.waitForTimeout(3000);
      
      try {
        const dashboardTitle = this.page.locator('text=Welcome to the administration').first();
        if (await dashboardTitle.isVisible({ timeout: 10000 })) {
          console.log('Успешный вход! Находимся на Dashboard');
          return true;
        }
      } catch (error) {
        console.log('Не найден заголовок Dashboard, проверяем другие элементы...');
      }
      
      const currentUrl = this.page.url();
      console.log(`Текущий URL после входа: ${currentUrl}`);
      
      if (currentUrl.includes('/dashboard') || currentUrl.includes('/#/dashboard') || !currentUrl.includes('/login')) {
        console.log('Вход выполнен успешно (по URL)');
        return true;
      }
      
      console.log('Вход не выполнен, остались на странице логина');
      return false;
      
    } catch (error) {
      console.error('Ошибка при выполнении входа:', error);
      return false;
    }
  }
}

export default LoginPage;