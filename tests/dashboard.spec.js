import { test, expect } from '@playwright/test'
import LoginPage from './pages/LoginPage.js'
import DashboardPage from './pages/DashboardPage.js'
import StatusesPage from './pages/StatusesPage.js'
import LabelsPage from './pages/LabelsPage.js'
import UsersPage from './pages/UsersPage.js'
import TasksPage from './pages/TasksPage.js'

test.describe('Проверка дашборда и навигации', () => {
  let loginPage, dashboardPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    dashboardPage = new DashboardPage(page)
    
    await loginPage.goto()
    await loginPage.login('qa_user', 'any_password')
    await dashboardPage.waitForPageLoaded()
  })

  test('дашборд успешно загружается после авторизации', async () => {
    await dashboardPage.verifyDashboardElements()
  })

  test('отображение раздела статусов задач', async ({ page }) => {
    const statusesPage = new StatusesPage(page)
    
    await dashboardPage.openStatusesList()
    await statusesPage.waitForPageLoaded()
    await statusesPage.verifyStatusesTable()
  })

  test('отображение раздела меток', async ({ page }) => {
    const labelsPage = new LabelsPage(page)
    
    await dashboardPage.openLabelsList()
    await labelsPage.waitForPageLoaded()
    await labelsPage.verifyLabelsTable()
  })

  test('отображение раздела пользователей', async ({ page }) => {
    const usersPage = new UsersPage(page)
    
    await dashboardPage.openUsersList()
    await usersPage.waitForPageLoaded()
    await usersPage.verifyUsersTable()
  })

  test('отображение раздела задач', async ({ page }) => {
    const tasksPage = new TasksPage(page)
    
    await dashboardPage.openTasksList()
    await tasksPage.waitForPageLoaded()
    await tasksPage.verifyTasksTable()
  })

  test('навигация по всем разделам из дашборда', async ({ page }) => {
    const statusesPage = new StatusesPage(page)
    const labelsPage = new LabelsPage(page)
    const usersPage = new UsersPage(page)
    const tasksPage = new TasksPage(page)

    await dashboardPage.openStatusesList()
    await statusesPage.waitForPageLoaded()

    await dashboardPage.openLabelsList()
    await labelsPage.waitForPageLoaded()

    await dashboardPage.openUsersList()
    await usersPage.waitForPageLoaded()

    await dashboardPage.openTasksList()
    await tasksPage.waitForPageLoaded()
  })

  test('выход из системы с дашборда', async () => {
    await dashboardPage.logout()
    await loginPage.waitForPageLoaded()
    await expect(loginPage.signInButton).toBeVisible()
  })
})