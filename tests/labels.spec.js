import { test, expect } from '@playwright/test'
import LoginPage from './pages/LoginPage.js'
import DashboardPage from './pages/DashboardPage.js'
import LabelsPage from './pages/LabelsPage.js'
import Helpers from './utils/helpers.js'

test.describe('Метки', () => {
  let loginPage, dashboardPage, labelsPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    dashboardPage = new DashboardPage(page)
    labelsPage = new LabelsPage(page)
    
    await loginPage.goto()
    await loginPage.login('admin', 'admin')
    await dashboardPage.waitForPageLoaded()
    await dashboardPage.openLabelsList()
    await labelsPage.waitForPageLoaded()
  })

  test('создание метки', async ({ page }) => {
    const labelName = Helpers.generateName('Label')
    await labelsPage.createLabel(labelName)
    
    await expect(page.getByText(labelName)).toBeVisible({ timeout: 10000 })
  })
})