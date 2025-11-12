const { test } = require('@playwright/test')
const LoginPage = require('../pages/LoginPage.js')
const DashboardPage = require('./pages/DashboardPage.js')
const LabelsPage = require('./pages/LabelsPage.js')

test.describe('Метки', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page)
    const dashboardPage = new DashboardPage(page)
    
    await loginPage.goto()
    await loginPage.login('admin', 'admin')
    await dashboardPage.waitForPageLoaded()
    await dashboardPage.openLabelsList()
  })

  test('создание метки', async ({ page }) => {
    const labelsPage = new LabelsPage(page)
    await labelsPage.waitForPageLoaded()
    
    const name = labelsPage.helpers.generateName('Label')
    
    await labelsPage.createLabel(name)
    await labelsPage.shouldSee(name)
  })

  test('удаление метки', async ({ page }) => {
    const labelsPage = new LabelsPage(page)
    await labelsPage.waitForPageLoaded()
    
    const name = labelsPage.helpers.generateName('Label')
    
    await labelsPage.createLabel(name)
    await labelsPage.shouldSee(name)
    await labelsPage.deleteLabel(name)
    await labelsPage.shouldNotSee(name)
  })
})