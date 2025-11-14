import { expect } from '@playwright/test'
import constants from './constants.js'

class Helpers {
  // АВТОРИЗАЦИЯ
  static async login(page, username = 'admin', password = 'admin') {
    try {
      await page.goto('http://localhost:5173')
      await page.waitForLoadState('networkidle')

      const usernameSelectors = [
        page.locator('input[name="username"]'),
        page.locator('input[placeholder*="Username"]'),
        page.locator('input[type="text"]').first()
      ]
      
      let usernameField = null
      for (const selector of usernameSelectors) {
        if (await selector.isVisible({ timeout: 2000 }).catch(() => false)) {
          usernameField = selector
          break
        }
      }
      
      if (!usernameField) {
        throw new Error('Username field not found')
      }

      const passwordSelectors = [
        page.locator('input[name="password"]'),
        page.locator('input[placeholder*="Password"]'),
        page.locator('input[type="password"]').first()
      ]
      
      let passwordField = null
      for (const selector of passwordSelectors) {
        if (await selector.isVisible({ timeout: 2000 }).catch(() => false)) {
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
        if (await selector.isVisible({ timeout: 2000 }).catch(() => false)) {
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
        page.locator('button:has-text("Profile")')
      ]
      
      let profileButton = null
      for (const selector of profileSelectors) {
        if (await selector.isVisible({ timeout: 10000 }).catch(() => false)) {
          profileButton = selector
          break
        }
      }
      
      if (!profileButton) {
        throw new Error('Profile button not found after login - authentication may have failed')
      }
      
      await expect(profileButton).toBeVisible()
      
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
        page.locator('button:has-text("Profile")')
      ]
      
      let profileButton = null
      for (const selector of profileSelectors) {
        if (await selector.isVisible({ timeout: 5000 }).catch(() => false)) {
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
        page.locator('button:has-text("Logout")')
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
      
      const signInSelectors = [
        page.getByRole('button', { name: 'Sign in' }),
        page.locator('button:has-text("Sign in")')
      ]
      
      let signInButton = null
      for (const selector of signInSelectors) {
        if (await selector.isVisible({ timeout: 10000 }).catch(() => false)) {
          signInButton = selector
          break
        }
      }
      
      if (!signInButton) {
        throw new Error('Sign in button not found after logout')
      }
      
      await expect(signInButton).toBeVisible()
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
    
    const menuItem = page.getByRole('menuitem', { name: sections[section] })
    await menuItem.click()
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
    const createSelectors = [
      page.locator('button:has-text("+ CREATE")'),
      page.locator('button:has-text("CREATE")'),
      page.getByRole('button', { name: '+ CREATE' }),
      page.getByRole('button', { name: 'CREATE' })
    ]
    
    for (const selector of createSelectors) {
      if (await selector.isVisible({ timeout: 5000 }).catch(() => false)) {
        await selector.click()
        await page.waitForLoadState('networkidle')
        return
      }
    }
    throw new Error('Create button not found')
  }

  static async clickSave(page) {
    const saveSelectors = [
      page.locator('button:has-text("SAVE")'),
      page.locator('button[type="submit"]'),
      page.getByRole('button', { name: 'SAVE' })
    ]
    
    for (const selector of saveSelectors) {
      if (await selector.isVisible({ timeout: 5000 }).catch(() => false)) {
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
      page.getByRole('button', { name: 'Confirm' })
    ]
    
    for (const selector of confirmSelectors) {
      if (await selector.isVisible({ timeout: 5000 }).catch(() => false)) {
        await selector.click()
        await page.waitForLoadState('networkidle')
        return
      }
    }
    throw new Error('Confirm button not found')
  }

  static async clickEdit(page, itemText) {
    const row = page.locator('tr', { has: page.getByText(itemText) })
    const editButton = row.getByRole('button', { name: 'Edit' })
    await editButton.first().click()
    await page.waitForLoadState('networkidle')
  }

  static async clickDelete(page, itemText) {
    const row = page.locator('tr', { has: page.getByText(itemText) })
    const deleteButton = row.getByRole('button', { name: 'Delete' })
    await deleteButton.click()
    await page.waitForLoadState('networkidle')
  }

  static async clickShow(page, itemText) {
    const row = page.locator('tr', { has: page.getByText(itemText) })
    const showButton = row.getByRole('button', { name: 'Show' })
    await showButton.first().click()
    await page.waitForLoadState('networkidle')
  }

  // РАБОТА С ФОРМАМИ 
  static async fillForm(page, fields) {
    for (const [label, value] of Object.entries(fields)) {
      if (value !== undefined && value !== null) {
        const field = page.getByLabel(label)
        await field.waitFor({ state: 'visible', timeout: 5000 })
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
}

export default Helpers