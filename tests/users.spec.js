import { test, expect } from '@playwright/test'
import LoginPage from './pages/LoginPage.js'
import DashboardPage from './pages/DashboardPage.js'
import UsersPage from './pages/UsersPage.js'
import Helpers from './utils/helpers.js'

test.describe('Пользователи', () => {
  let loginPage, dashboardPage, usersPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    dashboardPage = new DashboardPage(page)
    usersPage = new UsersPage(page)
    
    await loginPage.goto()
    await loginPage.login('admin', 'admin')
    await dashboardPage.waitForPageLoaded()
    await dashboardPage.openUsersList()
    await usersPage.waitForPageLoaded()
  })

  test('создание пользователя', async ({ page }) => {
    const email = Helpers.generateEmail()
    await usersPage.createUser(email, 'Test', 'User')
    await expect(page.getByText(email)).toBeVisible({ timeout: 10000 })
  })

  test('редактирование пользователя', async ({ page }) => {
    const oldEmail = Helpers.generateEmail()
    const newEmail = Helpers.generateEmail()
    
    await usersPage.createUser(oldEmail, 'Old', 'Name')
    await usersPage.clickEdit(oldEmail)
    await usersPage.fillUserForm(newEmail, 'New', 'Name')
    await usersPage.saveForm()
    
    await expect(page.getByText(newEmail)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(oldEmail)).not.toBeVisible({ timeout: 5000 })
  })

  test('удаление пользователя', async ({ page }) => {
    const email = Helpers.generateEmail()
    
    await usersPage.createUser(email, 'Delete', 'User')
    await expect(page.getByText(email)).toBeVisible({ timeout: 10000 })
    await usersPage.clickDelete(email)
    
    try {
      await usersPage.helpers.clickConfirm(page)
    } catch (e) {
    }
    
    await expect(page.getByText(email)).not.toBeVisible({ timeout: 5000 })
  })
})