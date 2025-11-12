const { test, expect } = require('@playwright/test')
const LoginPage = require('../pages/LoginPage.js')
const DashboardPage = require('./pages/DashboardPage.js')
const TasksPage = require('./pages/TasksPage.js')

test.describe('Тестирование канбан-доски', () => {
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

  // 1. СОЗДАНИЕ НОВЫХ ЗАДАЧ
  test('создание новой задачи', async () => {
    const taskTitle = `Новая задача ${Date.now()}`
    
    await tasksPage.clickCreateTask()
    await tasksPage.fillTaskForm({
      title: taskTitle,
      content: 'Описание задачи',
      assignee: 'jack@yahoo.com',
      status: 'Draft'
    })
    await tasksPage.saveTaskForm()
    
    await tasksPage.waitForPageLoaded()
    await tasksPage.verifyTaskInTable(taskTitle)
  })

  // 2. ПРОСМОТР СПИСКА ЗАДАЧ
  test('просмотр списка задач', async () => {
    await expect(tasksPage.header).toBeVisible()
    
    const rows = await tasksPage.page.locator('tbody tr').count()
    expect(rows).toBeGreaterThan(0)
  })

  // 3. РЕДАКТИРОВАНИЕ ИНФОРМАЦИИ О ЗАДАЧАХ
  test('редактирование задачи', async () => {
    const originalTitle = `Задача для редактирования ${Date.now()}`
    const updatedTitle = `Обновленная задача ${Date.now()}`
    
    await tasksPage.clickCreateTask()
    await tasksPage.fillTaskForm({
      title: originalTitle,
      content: 'Оригинальное описание',
      assignee: 'jack@yahoo.com',
      status: 'Draft'
    })
    await tasksPage.saveTaskForm()
    await tasksPage.waitForPageLoaded()
    
    await tasksPage.clickEditForTask(originalTitle)
    await tasksPage.fillTaskForm({
      title: updatedTitle,
      content: 'Обновленное описание'
    })
    await tasksPage.saveTaskForm()
    
    await tasksPage.waitForPageLoaded()
    await tasksPage.verifyTaskInTable(updatedTitle)
  })

  // 4. УДАЛЕНИЕ ЗАДАЧ
  test('удаление задачи', async () => {
    const taskToDelete = `Задача для удаления ${Date.now()}`
    
    await tasksPage.clickCreateTask()
    await tasksPage.fillTaskForm({
      title: taskToDelete,
      content: 'Описание для удаления',
      assignee: 'jack@yahoo.com',
      status: 'Draft'
    })
    await tasksPage.saveTaskForm()
    await tasksPage.waitForPageLoaded()
    
    await tasksPage.clickDeleteForTask(taskToDelete)
    await tasksPage.confirmDelete()
    
    await tasksPage.waitForPageLoaded()
    await tasksPage.verifyTaskNotInTable(taskToDelete)
  })

  // 5. МАССОВОЕ УДАЛЕНИЕ ЗАДАЧ
  test('массовое удаление задач', async () => {
    const tasksToCreate = [
      `Массовая задача 1 ${Date.now()}`,
      `Массовая задача 2 ${Date.now()}`
    ]
    
    for (const taskTitle of tasksToCreate) {
      await tasksPage.clickCreateTask()
      await tasksPage.fillTaskForm({
        title: taskTitle,
        content: `Описание ${taskTitle}`,
        assignee: 'jack@yahoo.com',
        status: 'Draft'
      })
      await tasksPage.saveTaskForm()
      await tasksPage.waitForPageLoaded()
    }
    
    await tasksPage.selectAllTasks()
    await tasksPage.clickBulkDelete()
    await tasksPage.confirmDelete()
    
    await tasksPage.waitForPageLoaded()
    
    for (const taskTitle of tasksToCreate) {
      await tasksPage.verifyTaskNotInTable(taskTitle)
    }
  })

  // 6. ФИЛЬТРАЦИЯ ЗАДАЧ
  test('фильтрация задач по статусу', async () => {
    const taskTitle = `Задача для фильтрации ${Date.now()}`
    
    await tasksPage.clickCreateTask()
    await tasksPage.fillTaskForm({
      title: taskTitle,
      content: 'Задача для тестирования фильтрации',
      assignee: 'jack@yahoo.com',
      status: 'Draft'
    })
    await tasksPage.saveTaskForm()
    await tasksPage.waitForPageLoaded()
    
    await tasksPage.filterByStatus('Draft')
    await tasksPage.page.waitForTimeout(1000)
    
    await tasksPage.verifyTaskInTable(taskTitle)
    
    await tasksPage.clearFilters()
  })

  test('фильтрация задач по исполнителю', async () => {
    const taskTitle = `Задача для Assignee ${Date.now()}`
    
    await tasksPage.clickCreateTask()
    await tasksPage.fillTaskForm({
      title: taskTitle,
      content: 'Задача для тестирования фильтрации по исполнителю',
      assignee: 'jane@gmail.com',
      status: 'Draft'
    })
    await tasksPage.saveTaskForm()
    await tasksPage.waitForPageLoaded()
    
    await tasksPage.filterByAssignee('jane@gmail.com')
    await tasksPage.page.waitForTimeout(1000)
    
    await tasksPage.verifyTaskInTable(taskTitle)
    
    await tasksPage.clearFilters()
  })

  // 7. ПЕРЕМЕЩЕНИЕ ЗАДАЧ МЕЖДУ КОЛОНКАМИ КАНБАН-ДОСКИ
  test('перемещение задачи между колонками канбан-доски', async () => {
    const taskTitle = `Задача для перемещения ${Date.now()}`
    
    // Создаем задачу
    await tasksPage.clickCreateTask()
    await tasksPage.fillTaskForm({
      title: taskTitle,
      content: 'Задача для тестирования перемещения',
      assignee: 'jack@yahoo.com',
      status: 'Draft'
    })
    await tasksPage.saveTaskForm()
    await tasksPage.waitForPageLoaded()
    
    // Находим задачу в колонке Draft и перетаскиваем в другую колонку
    const taskCard = tasksPage.page.locator('.task-card').filter({ hasText: taskTitle })
    const targetColumn = tasksPage.page.locator('.kanban-column').filter({ hasText: 'To Review' })
    
    await taskCard.dragTo(targetColumn)
    await tasksPage.page.waitForTimeout(1000)
    
    // Проверяем что задача переместилась
    await expect(targetColumn.getByText(taskTitle)).toBeVisible()
  })
})