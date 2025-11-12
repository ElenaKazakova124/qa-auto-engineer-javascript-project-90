const { expect } = require('@playwright/test')

class Helpers {
  // АВТОРИЗАЦИЯ
  static async login(page, username = 'admin', password = 'admin') {
    await page.goto('/')
    await page.getByLabel('Username*').fill(username)
    await page.getByLabel('Password*').fill(password)
    await page.getByRole('button', { name: 'SIGN IN' }).click()
    await expect(page.getByRole('button', { name: 'Profile' })).toBeVisible()
  }

  static async logout(page) {
    await page.getByRole('button', { name: 'Profile' }).click()
    await page.getByRole('menuitem', { name: 'Logout' }).click()
    await expect(page.getByRole('button', { name: 'SIGN IN' })).toBeVisible()
  }

  // НАВИГАЦИЯ 
  static async navigateTo(page, section) {
    const sections = {
      users: 'Users',
      statuses: 'Task statuses',
      labels: 'Labels',
      tasks: 'Tasks'
    }
    await page.getByRole('menuitem', { name: sections[section] }).click()
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
    await page.getByRole('button', { name: 'CREATE' }).click()
  }

  static async clickSave(page) {
    await page.getByRole('button', { name: 'SAVE' }).click()
  }

  static async clickConfirm(page) {
    await page.getByRole('button', { name: 'Confirm' }).click()
  }

  static async clickEdit(page, itemText) {
    const row = page.locator('tr', { has: page.getByText(itemText) })
    await row.getByRole('button', { name: 'EDIT' }).first().click()
  }

  static async clickDelete(page, itemText) {
    const row = page.locator('tr', { has: page.getByText(itemText) })
    await row.getByRole('button', { name: 'Delete' }).click()
  }

  static async clickShow(page, itemText) {
    const row = page.locator('tr', { has: page.getByText(itemText) })
    await row.getByRole('button', { name: 'SHOW' }).first().click()
  }

  // РАБОТА С ФОРМАМИ 
  static async fillForm(page, fields) {
    for (const [label, value] of Object.entries(fields)) {
      if (value !== undefined && value !== null) {
        await page.getByLabel(label).fill(value)
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
  }

  static async filterByStatus(page, status) {
    await page.locator('input[placeholder*="Status"]').first().click()
    await page.getByRole('option', { name: status }).click()
  }

  static async filterByLabel(page, label) {
    await page.locator('input[placeholder*="Label"]').first().click()
    await page.getByRole('option', { name: label }).click()
  }

  static async clearFilters(page) {
    const filters = [
      'input[placeholder*="Assignee"]',
      'input[placeholder*="Status"]',
      'input[placeholder*="Label"]'
    ]
    
    for (const filter of filters) {
      await page.locator(filter).first().click()
      await page.keyboard.press('Escape')
    }
    await page.getByPlaceholder('Search...').clear()
  }

  // МАССОВЫЕ ОПЕРАЦИИ 
  static async selectAll(page) {
    await page.locator('thead input[type="checkbox"]').check()
  }

  static async selectItem(page, itemText) {
    const row = page.locator('tr', { has: page.getByText(itemText) })
    await row.locator('input[type="checkbox"]').check()
  }

  static async clickBulkDelete(page) {
    await page.getByRole('button', { name: 'Delete' }).click()
  }

  // УТИЛИТЫ 
  static async waitForTimeout(page, ms = 1000) {
    await page.waitForTimeout(ms)
  }

  static async getRowCount(page) {
    return await page.locator('tbody tr').count()
  }
}

module.exports = Helpers