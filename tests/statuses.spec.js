import { test } from '@playwright/test'
import LoginPage from './pages/LoginPage.js'
import DashboardPage from './pages/DashboardPage.js'
import StatusesPage from './pages/StatusesPage.js'

test.describe('Статусы', () => {
  let loginPage, dashboardPage, statusesPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    dashboardPage = new DashboardPage(page)
    statusesPage = new StatusesPage(page)
    
    await loginPage.goto()
    await loginPage.login('admin', 'admin')
    await dashboardPage.waitForPageLoaded()
    await dashboardPage.openStatusesList()
    await statusesPage.waitForPageLoaded()
  })

  test('создание статуса', async () => {
    const statusName = statusesPage.helpers.generateName('Status')
    const slug = statusesPage.helpers.generateSlug()
    await statusesPage.createStatus(statusName, slug)
    await statusesPage.shouldSee(statusName)
  })
})