import { expect } from '@playwright/test'
import constants from './constants.js'

class Helpers {
  // АВТОРИЗАЦИЯ
  static async login(page, username = 'admin', password = 'admin') {
    try {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')
      
      const usernameField = page.getByLabel(constants.authElements.usernameLabel)
      const passwordField = page.getByLabel(constants.authElements.passwordLabel)
      const signInButton = page.getByRole('button', { name: constants.authElements.signInButton })

      await usernameField.fill(username)
      await passwordField.fill(password)
      await signInButton.click()
      
      await page.waitForLoadState('networkidle')
      
      const welcomeText = page.getByText(constants.mainPageElements.welcomeText)
      const dashboardLink = page.getByRole('menuitem', { name: constants.mainPageElements.dashboardMenuItemLabel })
      
      await expect(welcomeText.or(dashboardLink)).toBeVisible({ timeout: 15000 })
      
      console.log('✅ Login successful')
      
    } catch (error) {
      console.error('❌ Login failed:', error.message)
      await this.diagnosePageState(page, 'login-error')
      throw error
    }
  }

  static async logout(page) {
    try {
      const profileButton = page.locator(`button:has-text("${constants.mainPageElements.profileButtonLabel}")`).first()
      await profileButton.click()
      
      await page.waitForTimeout(2000)
      
      const logoutButton = page.locator(`text=${constants.mainPageElements.logoutButtonLabel}`).first()
      await logoutButton.evaluate(node => node.click())
      
      await page.waitForLoadState('networkidle')
      
      const signInButton = page.getByRole('button', { name: constants.authElements.signInButton })
      await expect(signInButton).toBeVisible({ timeout: 10000 })
      
      console.log('✅ Logout successful')
    } catch (error) {
      console.error('❌ Logout failed:', error.message)
      throw error
    }
  }

  // НАВИГАЦИЯ 
  static async navigateTo(page, section) {
    const sections = {
      dashboard: constants.mainPageElements.dashboardMenuItemLabel,
      users: constants.mainPageElements.usersMenuItemLabel,
      statuses: constants.mainPageElements.statusMenuItemLabel,
      labels: constants.mainPageElements.labelMenuItemLabel,
      tasks: constants.mainPageElements.tasksMenuItemLabel
    }
    
    if (!sections[section]) {
      throw new Error(`Unknown section: ${section}. Available: ${Object.keys(sections).join(', ')}`)
    }
    
    console.log(`Navigating to: ${sections[section]}`)
    
    const menuItem = page.locator(`a:has-text("${sections[section]}")`).first()
    await menuItem.click()
    await page.waitForLoadState('networkidle')
    
    console.log(`✅ Navigation to ${section} completed`)
  }

  // ГЕНЕРАЦИЯ ДАННЫХ 
  static generateEmail(prefix = 'test') {
    return `${prefix}${Date.now()}@example.com`
  }

  static generateName(prefix = 'Test') {
    return `${prefix}${Date.now()}`
  }

  static generateSlug(prefix = 'slug') {
    return `${prefix}-${Date.now()}`
  }

  static generateTaskTitle(prefix = 'Task') {
    return `${prefix} ${Date.now()}`
  }

  // ОСНОВНЫЕ ДЕЙСТВИЯ 
  static async clickCreate(page) {
    console.log('Looking for CREATE button...')
    
    const createButton = page.locator(`a:has-text("${constants.tableElements.createButton}")`).first()
    
    if (await createButton.isVisible({ timeout: 5000 })) {
      console.log('✅ Found CREATE button')
      await createButton.click()
      await page.waitForLoadState('networkidle')
      return
    }
    
    const createButtonAsButton = page.locator(`button:has-text("${constants.tableElements.createButton}")`).first()
    if (await createButtonAsButton.isVisible({ timeout: 5000 })) {
      console.log('✅ Found CREATE button (as button)')
      await createButtonAsButton.click()
      await page.waitForLoadState('networkidle')
      return
    }
    
    await this.diagnosePageState(page, 'create-button-not-found')
    throw new Error('Create button not found')
  }

  static async clickSave(page) {
    const saveButton = page.locator(`button:has-text("${constants.tableElements.saveButton}")`).first()
    
    if (await saveButton.isVisible({ timeout: 10000 })) {
      await saveButton.click()
      await page.waitForLoadState('networkidle')
      return
    }
    throw new Error('Save button not found')
  }

  static async fillForm(page, fields) {
    for (const [label, value] of Object.entries(fields)) {
      if (value !== undefined && value !== null) {
        let field = page.getByLabel(label)
        
        if (!(await field.isVisible().catch(() => false))) {
          field = page.locator(`input[name="${label.toLowerCase()}"], textarea[name="${label.toLowerCase()}"]`).first()
        }
        
        if (await field.isVisible().catch(() => false)) {
          await field.fill(value.toString())
          console.log(`✅ Filled field "${label}" with value: ${value}`)
        } else {
          console.warn(`⚠️ Field "${label}" not found`)
        }
      }
    }
  }

  static async selectOption(page, dropdownLabel, optionText) {
    const dropdown = page.getByLabel(dropdownLabel)
    await dropdown.click()
    
    const option = page.getByRole('option', { name: optionText })
    await option.click()
  }

  // ПРОВЕРКИ 

  static async shouldSee(page, text, timeout = 10000) {
    await expect(page.getByText(text).first()).toBeVisible({ timeout })
  }

  static async shouldNotSee(page, text, timeout = 5000) {
    await expect(page.getByText(text)).not.toBeVisible({ timeout })
  }

  static async shouldBeOnPage(page, expectedUrlPattern, timeout = 10000) {
    await page.waitForURL(expectedUrlPattern, { timeout })
  }

static async shouldSee(page, text, timeout = 10000) {
  console.log(`🔍 Ищем текст: "${text}"`);
  
  const containers = [
    '.card', 
    '.task-card',
    '.kanban-card',
    '[class*="card"]', 
    '.MuiCard-root',
    '.task-item', 
    '.item', 
    'table', 
    'tbody',
    '.list-group-item'
  ];
  
  for (const container of containers) {
    const locator = page.locator(container).filter({ hasText: text }).first();
    if (await locator.count() > 0) {
      console.log(`✅ Текст найден в контейнере: ${container}`);
      await expect(locator).toBeVisible({ timeout });
      return;
    }
  }
  
  console.log('🔄 Ищем текст по всей странице...');
  const anyLocator = page.locator(`*:has-text("${text}")`).first();
  await expect(anyLocator).toBeVisible({ timeout });
}

static async shouldSeeImproved(page, text, timeout = 10000) {
  console.log(`🔍 Улучшенный поиск текста: "${text}"`);
  
  const pageContent = await page.textContent('body');
  if (!pageContent || !pageContent.includes(text)) {
    console.log('❌ Текст не найден в содержимом страницы');
    throw new Error(`Текст "${text}" не найден на странице`);
  }
  
  console.log('✅ Текст найден в содержимом страницы, ищем видимый элемент...');
  
  const elements = page.locator(`*:has-text("${text}")`);
  const count = await elements.count();
  console.log(`Найдено элементов с текстом: ${count}`);
  
  for (let i = 0; i < count; i++) {
    const element = elements.nth(i);
    const isVisible = await element.isVisible();
    console.log(`Элемент ${i + 1}: видимый = ${isVisible}`);
    
    if (isVisible) {
      console.log(`✅ Найден видимый элемент с текстом`);
      return;
    }
  }
  
  console.log('🔄 Используем стандартный поиск...');
  await expect(page.getByText(text).first()).toBeVisible({ timeout });
}

static async shouldNotSee(page, text, timeout = 5000) {
  const locator = page.locator(`*:has-text("${text}")`).first();
  await expect(locator).not.toBeVisible({ timeout });
}

  // УТИЛИТЫ 
  static async waitForTimeout(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  static async getRowCount(page) {
    return await page.locator('tbody tr').count()
  }

  static async waitForPageLoad(page) {
    await page.waitForLoadState('networkidle')
    await page.waitForLoadState('domcontentloaded')
  }

  // ДИАГНОСТИКА СОСТОЯНИЯ СТРАНИЦЫ
  static async diagnosePageState(page, pageName = 'unknown') {
    console.log(`\n=== DIAGNOSIS FOR: ${pageName} ===`)
    console.log('Current URL:', page.url())
    
    const elementsToCheck = [
      { name: 'Profile button', selector: `button:has-text("${constants.mainPageElements.profileButtonLabel}")` },
      { name: 'CREATE button', selector: `a:has-text("${constants.tableElements.createButton}")` },
      { name: 'Dashboard link', selector: `a:has-text("${constants.mainPageElements.dashboardMenuItemLabel}")` },
      { name: 'Welcome text', selector: `text=${constants.mainPageElements.welcomeText}` }
    ]
    
    for (const element of elementsToCheck) {
      const locator = page.locator(element.selector).first()
      const isVisible = await locator.isVisible().catch(() => false)
      const count = await locator.count().catch(() => 0)
      console.log(`${element.name}: visible=${isVisible}, count=${count}`)
    }
    
    const tableRows = await page.locator('tbody tr').count()
    console.log(`Table rows: ${tableRows}`)
    
    await page.screenshot({ path: `debug-${pageName}-${Date.now()}.png` })
    console.log(`Screenshot saved: debug-${pageName}-${Date.now()}.png`)
    
    console.log('=== END DIAGNOSIS ===\n')
  }

  // СОЗДАНИЕ ТЕСТОВЫХ ДАННЫХ
  static async createTestData(page, type, data = {}) {
    const testData = {
      user: {
        email: this.generateEmail(),
        firstName: this.generateName('First'),
        lastName: this.generateName('Last'),
        ...data
      },
      status: {
        name: this.generateName('Status'),
        slug: this.generateSlug(),
        ...data
      },
      label: {
        name: this.generateName('Label'),
        ...data
      },
      task: {
        title: this.generateTaskTitle(),
        content: 'Test task description',
        ...data
      }
    }

    if (!testData[type]) {
      throw new Error(`Unknown data type: ${type}. Available: ${Object.keys(testData).join(', ')}`)
    }

    return testData[type]
  }
}

export default Helpers