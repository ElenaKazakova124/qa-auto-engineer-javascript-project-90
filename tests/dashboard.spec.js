import { test, expect } from '@playwright/test'
import DashboardPage from './pages/DashboardPage.js'
import Helpers from './utils/helpers.js'

test.describe('Проверка дашборда и навигации', () => {
  let dashboardPage

  test.beforeEach(async ({ page }) => {
    await Helpers.login(page, 'admin', 'admin')
    dashboardPage = new DashboardPage(page)
    await dashboardPage.waitForPageLoaded()
  })

  test('дашборд успешно загружается после авторизации', async ({ page }) => {
    await dashboardPage.verifyDashboardElements()
    
    await expect(page.getByText('Welcome to the administration')).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Tasks' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Users' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Labels' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Task statuses' })).toBeVisible()
  })

  test('навигация по разделам работает корректно', async ({ page }) => {
    await dashboardPage.openTasksList()
    await expect(page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /Tasks?/i })).toBeVisible({ timeout: 10000 })

    await page.goBack()
    await dashboardPage.waitForPageLoaded()

    await dashboardPage.openUsersList()
    await expect(page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /Users?/i })).toBeVisible({ timeout: 10000 })

    await page.goBack()
    await dashboardPage.waitForPageLoaded()

    await dashboardPage.openLabelsList()
    await expect(page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /Labels?/i })).toBeVisible({ timeout: 10000 })

    await page.goBack()
    await dashboardPage.waitForPageLoaded()

    await dashboardPage.openStatusesList()
    await expect(page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /Task statuses?/i })).toBeVisible({ timeout: 10000 })
  })
})