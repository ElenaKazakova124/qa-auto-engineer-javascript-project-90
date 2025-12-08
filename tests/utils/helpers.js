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
      
    } catch (error) {
      await this.diagnosePageState(page, 'login-error')
      throw error
    }
  }

  static async logout(page) {
    const profileButton = page.locator(`button:has-text("${constants.mainPageElements.profileButtonLabel}")`).first()
    await profileButton.click()
    
    await page.waitForTimeout(2000)
    
    const logoutButton = page.locator(`text=${constants.mainPageElements.logoutButtonLabel}`).first()
    await logoutButton.click({ force: true })
    
    await page.waitForLoadState('networkidle')
    
    const signInButton = page.getByRole('button', { name: constants.authElements.signInButton })
    await expect(signInButton).toBeVisible({ timeout: 10000 })
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
    
    const menuItem = page.locator(`a:has-text("${sections[section]}")`).first()
    await menuItem.click()
    await page.waitForLoadState('networkidle')
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
    const createButton = page.locator(`a:has-text("${constants.tableElements.createButton}")`).first()
    
    if (await createButton.isVisible({ timeout: 5000 })) {
      await createButton.click()
      await page.waitForLoadState('networkidle')
      return
    }
    
    const createButtonAsButton = page.locator(`button:has-text("${constants.tableElements.createButton}")`).first()
    if (await createButtonAsButton.isVisible({ timeout: 5000 })) {
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
    // Улучшенный метод поиска текста
    const pageContent = await page.textContent('body')
    if (!pageContent || !pageContent.includes(text)) {
      throw new Error(`Текст "${text}" не найден на странице`)
    }
    
    const elements = page.locator(`*:has-text("${text}")`)
    const count = await elements.count()
    
    for (let i = 0; i < count; i++) {
      const element = elements.nth(i)
      const isVisible = await element.isVisible()
      
      if (isVisible) {
        return
      }
    }
    
    await expect(page.getByText(text).first()).toBeVisible({ timeout })
  }

  static async shouldNotSee(page, text, timeout = 5000) {
    const locator = page.locator(`*:has-text("${text}")`).first()
    await expect(locator).not.toBeVisible({ timeout })
  }

  static async shouldBeOnPage(page, expectedUrlPattern, timeout = 10000) {
    await page.waitForURL(expectedUrlPattern, { timeout })
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
    const timestamp = Date.now()
    
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
    
    const tableRows = await page.locator('tbody tr').count().catch(() => 0)
    console.log(`Table rows: ${tableRows}`)
    
    await page.screenshot({ path: `debug-${pageName}-${timestamp}.png` }).catch(() => {
      console.log('Failed to take screenshot')
    })
    console.log(`Screenshot saved: debug-${pageName}-${timestamp}.png`)
    
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