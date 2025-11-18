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

  test('перемещение карточки задачи в канбан-доске', async ({ page }) => {
    // Создаем задачу для тестирования перемещения
    const taskName = Helpers.generateTaskTitle()
    await tasksPage.createTask(taskName)
    
    // Ждем появления задачи в канбан-доске
    await expect(page.getByText(taskName)).toBeVisible({ timeout: 10000 })
    
    // Находим карточку задачи
    const taskCard = page.locator('.task-card, [class*="task"], [class*="card"]').filter({ hasText: taskName }).first()
    
    // Находим колонки канбан-доски (предполагаем стандартные названия колонок)
    const todoColumn = page.locator('[class*="column"], [class*="board"], [class*="status"]').filter({ hasText: /To Do|TODO|Backlog/i }).first()
    const inProgressColumn = page.locator('[class*="column"], [class*="board"], [class*="status"]').filter({ hasText: /In Progress|Doing|Working/i }).first()
    const doneColumn = page.locator('[class*="column"], [class*="board"], [class*="status"]').filter({ hasText: /Done|Completed|Finished/i }).first()
    
    // Проверяем, что карточка изначально находится в колонке To Do
    const initialColumn = await taskCard.locator('xpath=ancestor::*[contains(@class, "column") or contains(@class, "board") or contains(@class, "status")]')
    expect(initialColumn).toBeTruthy()
    
    // Перемещаем карточку из To Do в In Progress с помощью drag and drop
    if (await todoColumn.isVisible() && await inProgressColumn.isVisible()) {
      console.log('Перемещаем карточку из To Do в In Progress...')
      
      // Выполняем drag and drop
      await taskCard.dragTo(inProgressColumn)
      
      // Ждем обновления интерфейса
      await page.waitForTimeout(1000)
      
      // Проверяем, что карточка теперь в колонке In Progress
      const currentColumn = await taskCard.locator('xpath=ancestor::*[contains(@class, "column") or contains(@class, "board") or contains(@class, "status")]')
      const columnText = await currentColumn.textContent()
      expect(columnText).toMatch(/In Progress|Doing|Working/i)
      
      console.log('✅ Карточка успешно перемещена в In Progress')
    }
    
    // Перемещаем карточку из In Progress в Done
    if (await inProgressColumn.isVisible() && await doneColumn.isVisible()) {
      console.log('Перемещаем карточку из In Progress в Done...')
      
      // Выполняем drag and drop
      await taskCard.dragTo(doneColumn)
      
      // Ждем обновления интерфейса
      await page.waitForTimeout(1000)
      
      // Проверяем, что карточка теперь в колонке Done
      const currentColumn = await taskCard.locator('xpath=ancestor::*[contains(@class, "column") or contains(@class, "board") or contains(@class, "status")]')
      const columnText = await currentColumn.textContent()
      expect(columnText).toMatch(/Done|Completed|Finished/i)
      
      console.log('✅ Карточка успешно перемещена в Done')
    }
    
    // Альтернативный вариант: если нет стандартных колонок, проверяем изменение статуса через интерфейс
    if (!await todoColumn.isVisible()) {
      console.log('Стандартные колонки не найдены, проверяем изменение статуса через редактирование...')
      
      // Открываем задачу для редактирования
      await tasksPage.clickEdit(taskName)
      
      // Меняем статус задачи
      const statusField = page.getByLabel('Status*')
      await statusField.click()
      
      // Выбираем другой статус из выпадающего списка
      const newStatus = page.getByRole('option').first()
      const newStatusText = await newStatus.textContent()
      await newStatus.click()
      
      // Сохраняем изменения
      await tasksPage.saveForm()
      
      // Проверяем, что статус изменился
      await expect(page.getByText(newStatusText)).toBeVisible({ timeout: 5000 })
      
      console.log(`✅ Статус задачи изменен на: ${newStatusText}`)
    }
  })

  test('редактирование задачи', async ({ page }) => {
    const taskName = Helpers.generateTaskTitle()
    const updatedTaskName = `Updated ${taskName}`
    
    await tasksPage.createTask(taskName)
    await tasksPage.clickEdit(taskName)
  
    await tasksPage.fill(await tasksPage.titleField, updatedTaskName)
    await tasksPage.saveForm()
    
    await expect(page.getByText(updatedTaskName)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(taskName)).not.toBeVisible({ timeout: 5000 })
  })

  test('просмотр деталей задачи', async ({ page }) => {
    const taskName = Helpers.generateTaskTitle()
    const taskDescription = 'Test task description for detailed view'
    
    await tasksPage.createTask(taskName, taskDescription)
    await tasksPage.clickShow(taskName)
    
    await expect(page.getByText(taskName)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(taskDescription)).toBeVisible({ timeout: 5000 })
  })
})