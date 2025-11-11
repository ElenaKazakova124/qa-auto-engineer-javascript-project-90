const { test, expect } = require('@playwright/test')
const LoginPage = require('../pages/LoginPage.js')
const DashboardPage = require('./pages/DashboardPage.js')

test.describe('Аутентификация и авторизация', () => {
  test('успешная авторизация и переход на дашборд', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const dashboardPage = new DashboardPage(page)

    await loginPage.goto()
    await loginPage.login('any_username', 'any_password')
    
    await dashboardPage.waitForPageLoaded()
    await expect(dashboardPage.profileButton).toBeVisible()
  })

  test('отображение формы авторизации', async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await loginPage.waitForPageLoaded()
  })

  test('выход с дашборда возвращает на страницу авторизации', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const dashboardPage = new DashboardPage(page)

    await loginPage.goto()
    await loginPage.login('any_username', 'any_password')
    await dashboardPage.waitForPageLoaded()
    
    await dashboardPage.logout()
    await loginPage.waitForPageLoaded()
  })

  test('навигация на защищенную страницу без авторизации перенаправляет на логин', async ({ page }) => {
    const loginPage = new LoginPage(page)

    await page.goto('/tasks')
    await loginPage.waitForPageLoaded()
  })
})