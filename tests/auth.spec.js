const { test, expect } = require('@playwright/test')
const LoginPage = require('../pages/LoginPage.js')
const DashboardPage = require('./pages/DashboardPage.js')

test('авторизация и выход', async ({ page }) => {
  const loginPage = new LoginPage(page)
  const dashboardPage = new DashboardPage(page)

  await loginPage.goto()
  await loginPage.login('admin', 'admin')
  await dashboardPage.waitForPageLoaded()
  await dashboardPage.logout()
  await loginPage.waitForPageLoaded()
  await expect(loginPage.signInButton).toBeVisible()
})