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
    
    console.log('Navigating to labels...')
    await dashboardPage.openLabelsList()
    
    await page.waitForLoadState('networkidle')
    console.log('URL после навигации на Labels:', page.url())
    
    await labelsPage.waitForPageLoaded()
  })

  test('создание метки', async ({ page }) => {
    const labelName = Helpers.generateName('Label')
    console.log(`Creating label: ${labelName}`)
    
    await labelsPage.createLabel(labelName)
    
    await expect(page.getByText(labelName)).toBeVisible({ timeout: 10000 })
  })
})