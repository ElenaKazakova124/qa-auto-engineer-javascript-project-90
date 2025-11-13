import { test } from '@playwright/test'
import LoginPage from '/pages/LoginPage.js'
import DashboardPage from './pages/DashboardPage.js'
import TasksPage from './pages/TasksPage.js'

test.describe('Задачи', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page)
    const dashboardPage = new DashboardPage(page)
    
    await loginPage.goto()
    await loginPage.login('admin', 'admin')
    await dashboardPage.waitForPageLoaded()
    await dashboardPage.openTasksList()
  })

  test('создание задачи', async ({ page }) => {
    const tasksPage = new TasksPage(page)
    await tasksPage.waitForPageLoaded()
    
    const title = tasksPage.helpers.generateTaskTitle()
    
    await tasksPage.createTask(title, 'Task description', 'jack@yahoo.com', 'Draft')
    await tasksPage.shouldSee(title)
  })

  test('фильтрация по статусу', async ({ page }) => {
    const tasksPage = new TasksPage(page)
    await tasksPage.waitForPageLoaded()
    
    const title = tasksPage.helpers.generateTaskTitle()
    
    await tasksPage.createTask(title, 'Task description', 'jack@yahoo.com', 'Draft')
    await tasksPage.filterByStatus('Draft')
    await tasksPage.shouldSee(title)
    await tasksPage.clearFilters()
  })

  test('фильтрация по исполнителю', async ({ page }) => {
    const tasksPage = new TasksPage(page)
    await tasksPage.waitForPageLoaded()
    
    const title = tasksPage.helpers.generateTaskTitle()
    
    await tasksPage.createTask(title, 'Task description', 'jack@yahoo.com', 'Draft')
    await tasksPage.filterByAssignee('jack@yahoo.com')
    await tasksPage.shouldSee(title)
    await tasksPage.clearFilters()
  })
})