import BasePage from './BasePage.js';
import constants from '../utils/constants.js';

class AppPage extends BasePage {
  constructor(page) {
    super(page);
  }

  // Простые уникальные локаторы
  get signInButton() {
    return this.page.getByRole('button', { name: constants.authElements.signInButton });
  }

  get welcomeText() {
    return this.page.locator(`text="${constants.mainPageElements.welcomeText}"`).first();
  }

  async waitForAppLoad(timeout = 15000) {
    console.log('Ожидание загрузки приложения...');
    
    // Просто ждем загрузки страницы
    await this.page.waitForLoadState('networkidle', { timeout });
    
    // Проверяем, что страница загрузилась (есть контент)
    await this.page.waitForSelector('body', { timeout });
    
  }

  async isAppLoaded() {
    try {
      // Проверяем, что body не пустой
      const bodyText = await this.page.textContent('body', { timeout: 3000 });
      return !!bodyText && bodyText.length > 0;
    } catch {
      return false;
    }
  }
}

export default AppPage;