import { expect } from '@playwright/test'
import constants from './constants.js'

class Helpers {
  // АВТОРИЗАЦИЯ
  static async login(page, username = 'admin', password = 'admin') {
    try {
      const baseUrl = process.env.NODE_ENV === 'test' ? 'http://localhost:5173' : 'http://localhost:5173'
      await page.goto(baseUrl)
      await page.waitForLoadState('networkidle')
      
      const usernameSelectors = [
        page.locator('input[name="username"]'),
        page.getByLabel('Username*'),
        page.locator('input[placeholder*="Username"]'),
        page.locator('input[type="text"]').first()
      ]
      
      let usernameField = null
      for (const selector of usernameSelectors) {
        if (await selector.isVisible({ timeout: 5000 }).catch(() => false)) {
          usernameField = selector
          break
        }
      }
      
      if (!usernameField) {
        throw new Error('Username field not found')
      }

      const passwordSelectors = [
        page.locator('input[name="password"]'),
        page.getByLabel('Password*'),
        page.locator('input[placeholder*="Password"]'),
        page.locator('input[type="password"]').first()
      ]
      
      let passwordField = null
      for (const selector of passwordSelectors) {
        if (await selector.isVisible({ timeout: 5000 }).catch(() => false)) {
          passwordField = selector
          break
        }
      }
      
      if (!passwordField) {
        throw new Error('Password field not found')
      }

      const buttonSelectors = [
        page.getByRole('button', { name: 'Sign in' }),
        page.locator('button:has-text("Sign in")'),
        page.locator('button[type="submit"]')
      ]
      
      let signInButton = null
      for (const selector of buttonSelectors) {
        if (await selector.isVisible({ timeout: 5000 }).catch(() => false)) {
          signInButton = selector
          break
        }
      }
      
      if (!signInButton) {
        throw new Error('Sign in button not found')
      }

      await usernameField.fill(username)
      await passwordField.fill(password)
      await signInButton.click()
      
      await page.waitForLoadState('networkidle')
      
      // Проверяем успешную авторизацию
      const profileSelectors = [
        page.getByRole('button', { name: 'Profile' }),
        page.locator('button:has-text("Profile")'),
        page.locator('[class*="Profile"]').first()
      ]
      
      let profileButton = null
      for (const selector of profileSelectors) {
        if (await selector.isVisible({ timeout: 15000 }).catch(() => false)) {
          profileButton = selector
          break
        }
      }
      
      if (!profileButton) {
        const dashboardElements = [
          page.getByText('Welcome'),
          page.getByRole('menuitem', { name: 'Users' }),
          page.getByRole('menuitem', { name: 'Task statuses' })
        ]
        
        let dashboardElement = null
        for (const element of dashboardElements) {
          if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
            dashboardElement = element
            break
          }
        }
        
        if (!dashboardElement) {
          throw new Error('Login successful but neither profile button nor dashboard elements found')
        }
        console.log('✅ Login successful - dashboard detected')
        return
      }
      
      await expect(profileButton).toBeVisible()
      console.log('✅ Login successful - profile button found')
      
    } catch (error) {
      const pageContent = await page.content().catch(() => 'Could not get page content')
      console.log('Page content during login error:', pageContent.substring(0, 1000))
      throw new Error(`Login failed for user ${username}: ${error.message}`)
    }
  }

  static async logout(page) {
    try {
      const profileSelectors = [
        page.getByRole('button', { name: 'Profile' }),
        page.locator('button:has-text("Profile")'),
        page.locator('[class*="Profile"]').first()
      ]
      
      let profileButton = null
      for (const selector of profileSelectors) {
        if (await selector.isVisible({ timeout: 10000 }).catch(() => false)) {
          profileButton = selector
          break
        }
      }
      
      if (!profileButton) {
        throw new Error('Profile button not found for logout')
      }
      
      await profileButton.click()
      
      const logoutSelectors = [
        page.getByRole('menuitem', { name: 'Logout' }),
        page.locator('button:has-text("Logout")'),
        page.locator('li:has-text("Logout")')
      ]
      
      let logoutButton = null
      for (const selector of logoutSelectors) {
        if (await selector.isVisible({ timeout: 5000 }).catch(() => false)) {
          logoutButton = selector
          break
        }
      }
      
      if (!logoutButton) {
        throw new Error('Logout button not found')
      }
      
      await logoutButton.click()
      await page.waitForLoadState('networkidle')
      
      // Проверяем, что вернулись на страницу логина
      const signInSelectors = [
        page.getByRole('button', { name: 'Sign in' }),
        page.locator('button:has-text("Sign in")'),
        page.locator('input[name="username"]')
      ]
      
      let signInElement = null
      for (const selector of signInSelectors) {
        if (await selector.isVisible({ timeout: 10000 }).catch(() => false)) {
          signInElement = selector
          break
        }
      }
      
      if (!signInElement) {
        throw new Error('Sign in elements not found after logout')
      }
      
      await expect(signInElement).toBeVisible()
      console.log('✅ Logout successful')
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
    
    console.log(`Navigating to: ${sections[section]}`)
    
    const menuItem = page.getByRole('menuitem', { name: sections[section] })
    await menuItem.click()
    await page.waitForLoadState('networkidle')
    
    // Ждем загрузки целевой страницы
    await page.waitForTimeout(2000)
    
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
    
    const createSelectors = [
      page.locator('button:has-text("+ CREATE")'),
      page.locator('button:has-text("CREATE")'),
      page.locator('button:has-text("Create")'),
      page.locator('button:has-text("+ Create")'),
      page.locator('[aria-label*="create"]'),
      page.locator('[aria-label*="add"]'),
      page.locator('[aria-label*="new"]'),
      page.getByRole('button', { name: '+ CREATE' }),
      page.getByRole('button', { name: 'CREATE' }),
      page.getByRole('button', { name: 'Create' })
    ]
    
    for (const selector of createSelectors) {
      const isVisible = await selector.isVisible({ timeout: 5000 }).catch(() => false)
      if (isVisible) {
        console.log(`✅ Found CREATE button with selector: ${selector}`)
        await selector.click()
        await page.waitForLoadState('networkidle')
        return
      }
    }
    
    // Если кнопка не найдена, выведем отладочную информацию
    console.log('❌ CREATE button not found. Debug info:')
    const buttons = await page.$$('button')
    console.log(`Total buttons on page: ${buttons.length}`)
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i]
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      console.log(`Button ${i}: text="${text?.trim()}", aria-label="${ariaLabel}"`)
    }
    
    throw new Error('Create button not found')
  }

  static async clickSave(page) {
    const saveSelectors = [
      page.locator('button:has-text("SAVE")'),
      page.locator('button:has-text("Save")'),
      page.locator('button[type="submit"]'),
      page.getByRole('button', { name: 'SAVE' }),
      page.getByRole('button', { name: 'Save' })
    ]
    
    for (const selector of saveSelectors) {
      if (await selector.isVisible({ timeout: 10000 }).catch(() => false)) {
        await selector.click()
        await page.waitForLoadState('networkidle')
        return
      }
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
    const editSelectors = [
      row.getByRole('button', { name: 'Edit' }),
      row.getByRole('button', { name: 'EDIT' }),
      row.locator('button:has-text("Edit")'),
      row.locator('button:has-text("EDIT")')
    ]
    
    for (const selector of editSelectors) {
      if (await selector.isVisible({ timeout: 5000 }).catch(() => false)) {
        await selector.first().click()
        await page.waitForLoadState('networkidle')
        return
      }
    }
    throw new Error(`Edit button not found for item: ${itemText}`)
  }

  static async clickDelete(page, itemText) {
    const row = page.locator('tr', { has: page.getByText(itemText) })
    const deleteSelectors = [
      row.getByRole('button', { name: 'Delete' }),
      row.locator('button:has-text("Delete")')
    ]
    
    for (const selector of deleteSelectors) {
      if (await selector.isVisible({ timeout: 5000 }).catch(() => false)) {
        await selector.click()
        await page.waitForLoadState('networkidle')
        return
      }
    }
    throw new Error(`Delete button not found for item: ${itemText}`)
  }

  static async clickShow(page, itemText) {
    const row = page.locator('tr', { has: page.getByText(itemText) })
    const showSelectors = [
      row.getByRole('button', { name: 'Show' }),
      row.getByRole('button', { name: 'SHOW' }),
      row.locator('button:has-text("Show")'),
      row.locator('button:has-text("SHOW")')
    ]
    
    for (const selector of showSelectors) {
      if (await selector.isVisible({ timeout: 5000 }).catch(() => false)) {
        await selector.first().click()
        await page.waitForLoadState('networkidle')
        return
      }
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
      if (await filterElement.isVisible({ timeout: 2000 }).catch(() => false)) {
        await filterElement.click()
        await page.keyboard.press('Escape')
      }
    }
    
    const search = page.getByPlaceholder('Search...')
    if (await search.isVisible({ timeout: 2000 }).catch(() => false)) {
      await search.clear()
    }
    
    await page.waitForLoadState('networkidle')
  }

  // МАССОВЫЕ ОПЕРАЦИИ 
  static async selectAll(page) {
    const checkbox = page.locator('thead input[type="checkbox"]')
    if (await checkbox.isVisible({ timeout: 5000 }).catch(() => false)) {
      await checkbox.check()
    }
  }

  static async selectItem(page, itemText) {
    const row = page.locator('tr', { has: page.getByText(itemText) })
    const checkbox = row.locator('input[type="checkbox"]')
    if (await checkbox.isVisible({ timeout: 5000 }).catch(() => false)) {
      await checkbox.check()
    }
  }

  static async clickBulkDelete(page) {
    const deleteSelectors = [
      page.locator('button:has-text("Delete")'),
      page.getByRole('button', { name: 'Delete' })
    ]
    
    for (const selector of deleteSelectors) {
      if (await selector.isVisible({ timeout: 5000 }).catch(() => false)) {
        await selector.click()
        await page.waitForLoadState('networkidle')
        return
      }
    }
    throw new Error('Bulk delete button not found')
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

  // ОТЛАДОЧНЫЕ МЕТОДЫ
  static async debugPage(page, description = '') {
    console.log(`=== DEBUG: ${description} ===`)
    console.log('URL:', page.url())
    console.log('Title:', await page.title())
    
    const visibleButtons = await page.$$eval('button', buttons => 
      buttons.map(btn => btn.textContent?.trim()).filter(Boolean)
    )
    console.log('Visible buttons:', visibleButtons.slice(0, 10))
    
    const visibleInputs = await page.$$eval('input', inputs => 
      inputs.map(input => ({
        name: input.name,
        type: input.type,
        placeholder: input.placeholder,
        id: input.id
      }))
    )
    console.log('Visible inputs:', visibleInputs.slice(0, 5))
  }

  // ДИАГНОСТИКА СОСТОЯНИЯ СТРАНИЦЫ
  static async diagnosePageState(page, pageName = 'unknown') {
    console.log(`\n=== DIAGNOSIS FOR: ${pageName} ===`)
    console.log('Current URL:', page.url())
    
    // Проверяем наличие основных элементов
    const profileButton = await page.getByRole('button', { name: 'Profile' }).isVisible().catch(() => false)
    console.log(`Profile button visible: ${profileButton}`)
    
    // Проверяем наличие кнопки CREATE
    const createButtons = [
      'button:has-text("+ CREATE")',
      'button:has-text("CREATE")',
      'button:has-text("Create")'
    ]
    
    for (const selector of createButtons) {
      const element = page.locator(selector)
      const count = await element.count()
      const visible = await element.isVisible().catch(() => false)
      console.log(`Selector "${selector}": count=${count}, visible=${visible}`)
    }
    
    // Проверяем наличие таблицы
    const tableRows = await page.locator('tbody tr').count()
    console.log(`Table rows: ${tableRows}`)
    
    // Проверяем наличие заголовка страницы
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements => 
      elements.map(el => ({ tag: el.tagName, text: el.textContent?.trim() }))
    )
    console.log('Headings:', headings.slice(0, 3))
    
    console.log('=== END DIAGNOSIS ===\n')
  }
}

export default Helpers