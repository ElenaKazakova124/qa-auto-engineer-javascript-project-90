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
})