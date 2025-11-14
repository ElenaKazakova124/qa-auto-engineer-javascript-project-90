import { test, expect } from '@playwright/test'
import LoginPage from './pages/LoginPage.js'
import DashboardPage from './pages/DashboardPage.js'
import TasksPage from './pages/TasksPage.js'
import Helpers from './utils/helpers.js'

test.describe('Задачи', () => {
  let loginPage, dashboardPage, tasksPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    dashboardPage = new DashboardPage(page)
    tasksPage = new TasksPage(page)
    
    await loginPage.goto()
    await loginPage.login('admin', 'admin')
    await dashboardPage.waitForPageLoaded()
    await dashboardPage.openTasksList()
    await tasksPage.waitForPageLoaded()
  })

  test('создание задачи', async ({ page }) => {
    const taskName = Helpers.generateTaskTitle()
    await tasksPage.createTask(taskName)
    await expect(page.getByText(taskName)).toBeVisible({ timeout: 10000 })
  })
})