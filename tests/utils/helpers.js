import { expect } from '@playwright/test'

class Helpers {
  // АВТОРИЗАЦИЯ
  static async login(page, username = 'admin', password = 'admin') {
    try {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      await page.getByLabel('Username*').waitFor({ state: 'visible' })
      await page.getByLabel('Password*').waitFor({ state: 'visible' })
      
      await page.getByLabel('Username*').fill(username)
      await page.getByLabel('Password*').fill(password)
      await page.getByRole('button', { name: 'SIGN IN' }).click()
      
      await page.waitForLoadState('networkidle')
      await expect(page.getByRole('button', { name: 'Profile' })).toBeVisible()
    } catch (error) {
      throw new Error(`Login failed for user ${username}: ${error.message}`)
    }
  }

  static async logout(page) {
    try {
      await page.getByRole('button', { name: 'Profile' }).click()
      await page.getByRole('menuitem', { name: 'Logout' }).click()
      await page.waitForLoadState('networkidle')
      await expect(page.getByRole('button', { name: 'SIGN IN' })).toBeVisible()
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`)
    }
  }

  // НАВИГАЦИЯ 
  static async navigateTo(page, section) {
    const sections = {
      users: 'Users',
      statuses: 'Task statuses',
      labels: 'Labels',
      tasks: 'Tasks'
    }
    
    if (!sections[section]) {
      throw new Error(`Unknown section: ${section}. Available: ${Object.keys(sections).join(', ')}`)
    }
    
    await page.getByRole('menuitem', { name: sections[section] }).click()
    await page.waitForLoadState('networkidle')
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
    await page.locator('button:has-text("CREATE")').first().click()
    await page.waitForLoadState('networkidle')
  }

  static async clickSave(page) {
    await page.locator('button:has-text("SAVE"), button[type="submit"]').first().click()
    await page.waitForLoadState('networkidle')
  }

  static async clickConfirm(page) {
    await page.locator('button:has-text("Confirm")').first().click()
    await page.waitForLoadState('networkidle')
  }

  static async clickEdit(page, itemText) {
    const row = page.locator('tr', { has: page.getByText(itemText) })
    await row.getByRole('button', { name: 'EDIT' }).first().click()
    await page.waitForLoadState('networkidle')
  }

  static async clickDelete(page, itemText) {
    const row = page.locator('tr', { has: page.getByText(itemText) })
    await row.getByRole('button', { name: 'Delete' }).click()
    await page.waitForLoadState('networkidle')
  }

  static async clickShow(page, itemText) {
    const row = page.locator('tr', { has: page.getByText(itemText) })
    await row.getByRole('button', { name: 'SHOW' }).first().click()
    await page.waitForLoadState('networkidle')
  }

  // РАБОТА С ФОРМАМИ 
  static async fillForm(page, fields) {
    for (const [label, value] of Object.entries(fields)) {
      if (value !== undefined && value !== null) {
        const field = page.getByLabel(label)
        await field.waitFor({ state: 'visible' })
        await field.fill(value.toString())
      }
    }
  }

  static async selectOption(page, dropdownLabel, optionText) {
    await page.getByLabel(dropdownLabel).click()
    await page.getByRole('option', { name: optionText }).click()
  }

  // ПРОВЕРКИ 
  static async shouldSee(page, text) {
    await expect(page.getByText(text)).toBeVisible()
  }

  static async shouldNotSee(page, text) {
    await expect(page.getByText(text)).not.toBeVisible()
  }

  // ФИЛЬТРАЦИЯ 
  static async filterByAssignee(page, assignee) {
    await page.locator('input[placeholder*="Assignee"]').first().click()
    await page.getByRole('option', { name: assignee }).click()
    await page.waitForLoadState('networkidle')
  }

  static async filterByStatus(page, status) {
    await page.locator('input[placeholder*="Status"]').first().click()
    await page.getByRole('option', { name: status }).click()
    await page.waitForLoadState('networkidle')
  }

  static async filterByLabel(page, label) {
    await page.locator('input[placeholder*="Label"]').first().click()
    await page.getByRole('option', { name: label }).click()
    await page.waitForLoadState('networkidle')
  }

  static async clearFilters(page) {
    const filters = [
      'input[placeholder*="Assignee"]',
      'input[placeholder*="Status"]',
      'input[placeholder*="Label"]'
    ]
    
    for (const filter of filters) {
      const filterElement = page.locator(filter).first()
      if (await filterElement.isVisible()) {
        await filterElement.click()
        await page.keyboard.press('Escape')
      }
    }
    
    const search = page.getByPlaceholder('Search...')
    if (await search.isVisible()) {
      await search.clear()
    }
    
    await page.waitForLoadState('networkidle')
  }

  // МАССОВЫЕ ОПЕРАЦИИ 
  static async selectAll(page) {
    const checkbox = page.locator('thead input[type="checkbox"]')
    if (await checkbox.isVisible()) {
      await checkbox.check()
    }
  }

  static async selectItem(page, itemText) {
    const row = page.locator('tr', { has: page.getByText(itemText) })
    const checkbox = row.locator('input[type="checkbox"]')
    if (await checkbox.isVisible()) {
      await checkbox.check()
    }
  }

  static async clickBulkDelete(page) {
    await page.locator('button:has-text("Delete")').first().click()
    await page.waitForLoadState('networkidle')
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
}

export default Helpers