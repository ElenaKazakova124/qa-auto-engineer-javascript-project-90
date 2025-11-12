const { test } = require('@playwright/test')
const LoginPage = require('../pages/LoginPage.js')
const DashboardPage = require('./pages/DashboardPage.js')
const StatusesPage = require('./pages/StatusesPage.js')

test.describe('Статусы', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page)
    const dashboardPage = new DashboardPage(page)
    
    await loginPage.goto()
    await loginPage.login('admin', 'admin')
    await dashboardPage.waitForPageLoaded()
    await dashboardPage.openStatusesList()
  })

  test('создание статуса', async ({ page }) => {
    const statusesPage = new StatusesPage(page)
    await statusesPage.waitForPageLoaded()
    
    const name = statusesPage.helpers.generateName('Status')
    const slug = statusesPage.helpers.generateSlug()
    
    await statusesPage.createStatus(name, slug)
    await statusesPage.shouldSee(name)
  })

  test('удаление статуса', async ({ page }) => {
    const statusesPage = new StatusesPage(page)
    await statusesPage.waitForPageLoaded()
    
    const name = statusesPage.helpers.generateName('Status')
    const slug = statusesPage.helpers.generateSlug()
    
    await statusesPage.createStatus(name, slug)
    await statusesPage.shouldSee(name)
    await statusesPage.deleteStatus(name)
    await statusesPage.shouldNotSee(name)
  })
})