import { expect } from '@playwright/test'
import constants from './constants.js'

class Helpers {
  // АВТОРИЗАЦИЯ
  static async login(page, username = 'admin', password = 'admin') {
    try {
      const baseUrl = process.env.NODE_ENV === 'test' ? 'http://localhost:5173' : 'http://localhost:5173'
      await page.goto(baseUrl)
      await page.waitForLoadState('networkidle')
      
      const usernameField = page.getByLabel(constants.authElements.usernameLabel)
      const passwordField = page.getByLabel(constants.authElements.passwordLabel)
      const signInButton = page.getByRole('button', { name: constants.authElements.signInButton })

      await usernameField.fill(username)
      await passwordField.fill(password)
      await signInButton.click()
      
      await page.waitForLoadState('networkidle')
      
      const welcomeText = page.getByText(constants.mainPageElements.welcomeText)
      await expect(welcomeText).toBeVisible({ timeout: 15000 })
      
      console.log('✅ Login successful - welcome text found')
      
    } catch (error) {
      const pageContent = await page.content().catch(() => 'Could not get page content')
      console.log('Page content during login error:', pageContent.substring(0, 1000))
      throw new Error(`Login failed for user ${username}: ${error.message}`)
    }
  }

  static async logout(page) {
    try {
      const profileButton = page.getByRole('button', { name: constants.mainPageElements.profileButtonLabel })
      await profileButton.click()
      
      const logoutButton = page.getByRole('menuitem', { name: constants.mainPageElements.logoutButtonLabel })
      await logoutButton.click()
      
      await page.waitForLoadState('networkidle')
      
      const signInButton = page.getByRole('button', { name: constants.authElements.signInButton })
      await expect(signInButton).toBeVisible({ timeout: 10000 })
      
      console.log('✅ Logout successful')
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`)
    }
  }

  // НАВИГАЦИЯ 
  static async navigateTo(page, section) {
    const sections = {
      users: constants.mainPageElements.usersMenuItemLabel,
      statuses: constants.mainPageElements.statusMenuItemLabel,
      labels: constants.mainPageElements.labelMenuItemLabel,
      tasks: constants.mainPageElements.tasksMenuItemLabel
    }
    
    if (!sections[section]) {
      throw new Error(`Unknown section: ${section}. Available: ${Object.keys(sections).join(', ')}`)
    }
    
    console.log(`Navigating to: ${sections[section]}`)
    
    const menuItem = page.getByRole('menuitem', { name: sections[section] })
    await menuItem.click()
    await page.waitForLoadState('networkidle')
    
    console.log(`✅ Navigation to ${section} completed`)
  }

  // ГЕНЕРАЦИЯ ДАННЫХ 
  static generateEmail() {
    return `test${Date.now()}@example.com`
  }

  static generateName(prefix = 'Test') {
    return `${prefix}${Date.now()}`
  }

  static generateSlug() {
    return `slug-${Date.now()}`
  }

  static generateTaskTitle() {
    return `Task ${Date.now()}`
  }

  // ОСНОВНЫЕ ДЕЙСТВИЯ 
  static async clickCreate(page) {
    console.log('Looking for CREATE button...')
    
    const createButton = page.locator(`button:has-text("${constants.tableElements.createButton}")`)
    
    if (await createButton.isVisible({ timeout: 5000 })) {
      console.log('✅ Found CREATE button')
      await createButton.click()
      await page.waitForLoadState('networkidle')
      return
    }
    
    console.log('❌ CREATE button not found. Debug info:')
    const buttons = await page.$$('button')
    console.log(`Total buttons on page: ${buttons.length}`)
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i]
      const text = await button.textContent()
      console.log(`Button ${i}: "${text?.trim()}"`)
    }
    
    throw new Error('Create button not found')
  }

  static async clickSave(page) {
    const saveButton = page.locator(`button:has-text("${constants.tableElements.saveButton}")`)
    
    if (await saveButton.isVisible({ timeout: 10000 })) {
      await saveButton.click()
      await page.waitForLoadState('networkidle')
      return
    }
    throw new Error('Save button not found')
  }

  static async clickConfirm(page) {
    const confirmSelectors = [
      page.locator('button:has-text("Confirm")'),
      page.locator('button:has-text("confirm")'),
      page.getByRole('button', { name: 'Confirm' })
    ]
    
    for (const selector of confirmSelectors) {
      if (await selector.isVisible({ timeout: 10000 }).catch(() => false)) {
        await selector.click()
        await page.waitForLoadState('networkidle')
        return
      }
    }
    throw new Error('Confirm button not found')
  }

  static async clickEdit(page, itemText) {
    const row = page.locator('tr', { has: page.getByText(itemText) })
    const editButton = row.locator(`button:has-text("${constants.tableElements.editButton}")`)
    
    if (await editButton.isVisible({ timeout: 5000 })) {
      await editButton.click()
      await page.waitForLoadState('networkidle')
      return
    }
    throw new Error(`Edit button not found for item: ${itemText}`)
  }

  static async clickDelete(page, itemText) {
    const row = page.locator('tr', { has: page.getByText(itemText) })
    const deleteButton = row.locator(`button:has-text("${constants.tableElements.deleteButton}")`)
    
    if (await deleteButton.isVisible({ timeout: 5000 })) {
      await deleteButton.click()
      await page.waitForLoadState('networkidle')
      return
    }
    throw new Error(`Delete button not found for item: ${itemText}`)
  }

  static async clickShow(page, itemText) {
    const row = page.locator('tr', { has: page.getByText(itemText) })
    const showButton = row.locator(`button:has-text("${constants.tableElements.showButton}")`)
    
    if (await showButton.isVisible({ timeout: 5000 })) {
      await showButton.click()
      await page.waitForLoadState('networkidle')
      return
    }
    throw new Error(`Show button not found for item: ${itemText}`)
  }

  // РАБОТА С ФОРМАМИ 
  static async fillForm(page, fields) {
    for (const [label, value] of Object.entries(fields)) {
      if (value !== undefined && value !== null) {
        const field = page.getByLabel(label)
        await field.waitFor({ state: 'visible', timeout: 10000 })
        await field.fill(value.toString())
        console.log(`Filled field "${label}" with value: ${value}`)
      }
    }
  }

  static async selectOption(page, dropdownLabel, optionText) {
    await page.getByLabel(dropdownLabel).click()
    await page.getByRole('option', { name: optionText }).click()
  }

  // ПРОВЕРКИ 
  static async shouldSee(page, text) {
    await expect(page.getByText(text).first()).toBeVisible({ timeout: 10000 })
  }

  static async shouldNotSee(page, text) {
    await expect(page.getByText(text)).not.toBeVisible({ timeout: 5000 })
  }

  // УТИЛИТЫ 
  static async waitForTimeout(page, ms = 1000) {
    await page.waitForTimeout(ms)
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
    
    const profileButton = await page.getByRole('button', { name: 'Profile' }).isVisible().catch(() => false)
    console.log(`Profile button visible: ${profileButton}`)
    
    const createButton = page.locator(`button:has-text("${constants.tableElements.createButton}")`)
    const createCount = await createButton.count()
    const createVisible = await createButton.isVisible().catch(() => false)
    console.log(`CREATE button: count=${createCount}, visible=${createVisible}`)
    
    const tableRows = await page.locator('tbody tr').count()
    console.log(`Table rows: ${tableRows}`)
    
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements => 
      elements.map(el => ({ tag: el.tagName, text: el.textContent?.trim() }))
    )
    console.log('Headings:', headings.slice(0, 3))
    
    console.log('=== END DIAGNOSIS ===\n')
  }
}

export default Helpers