const { test, expect } = require('@playwright/test')
const LoginPage = require('../pages/LoginPage.js')
const DashboardPage = require('./pages/DashboardPage.js')
const StatusesPage = require('./pages/StatusesPage.js')

test.describe('Тестирование статусов', () => {
  let loginPage, dashboardPage, statusesPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    dashboardPage = new DashboardPage(page)
    statusesPage = new StatusesPage(page)
    
    // Авторизация и переход к статусам
    await loginPage.goto()
    await loginPage.login('admin', 'admin')
    await dashboardPage.waitForPageLoaded()
    await dashboardPage.openStatusesList()
    await statusesPage.waitForPageLoaded()
  })

  // 1. ТЕСТИРОВАНИЕ СОЗДАНИЯ НОВЫХ СТАТУСОВ
  test.describe('Создание новых статусов', () => {
    test('форма создания статуса отображается корректно', async () => {
      // Убедиться, что форма создания статуса отображается корректно
      await statusesPage.clickCreateStatus()
      
      // Проверяем все элементы формы
      await expect(statusesPage.nameInput).toBeVisible()
      await expect(statusesPage.slugInput).toBeVisible()
      await expect(statusesPage.saveButton).toBeVisible()
      
      // Проверяем обязательные поля
      await expect(statusesPage.page.getByText('Name*')).toBeVisible()
      await expect(statusesPage.page.getByText('Slug*')).toBeVisible()
    })

    test('данные нового статуса сохраняются правильно', async () => {
      // Ввести данные нового статуса в форму и убедиться, что данные сохраняются правильно
      const testName = `Test Status ${Date.now()}`
      const testSlug = `test-status-${Date.now()}`
      
      await statusesPage.clickCreateStatus()
      await statusesPage.fillStatusForm(testName, testSlug)
      await statusesPage.saveStatusForm()
      
      // Проверяем что сохранились правильные данные
      await statusesPage.waitForPageLoaded()
      await statusesPage.verifyStatusInTable(testName, testSlug)
    })
  })

  // 2. ТЕСТИРОВАНИЕ ПРОСМОТРА СПИСКА СТАТУСОВ
  test.describe('Просмотр списка статусов', () => {
    test('список статусов отображается полностью и корректно', async () => {
      // Убедиться, что список статусов отображается полностью и корректно
      await expect(statusesPage.header).toBeVisible()
      
      // Проверяем что таблица не пустая
      const rows = await statusesPage.page.locator('tbody tr').count()
      expect(rows).toBeGreaterThan(0)
      
      // Проверяем заголовки таблицы
      const headers = ['Id', 'Name', 'Slug', 'Created at']
      for (const header of headers) {
        await expect(statusesPage.page.getByText(header)).toBeVisible()
      }
    })

    test('отображается основная информация о каждом статусе', async () => {
      // Проверить, что отображается основная информация о каждом статусе: название и slug
      const firstRow = statusesPage.page.locator('tbody tr').first()
      
      // Проверяем что в каждой строке есть название и slug
      const nameCell = firstRow.locator('td').nth(1) // Вторая колонка - Name
      const slugCell = firstRow.locator('td').nth(2) // Третья колонка - Slug
      
      await expect(nameCell).not.toBeEmpty()
      await expect(slugCell).not.toBeEmpty()
      
      const nameText = await nameCell.textContent()
      const slugText = await slugCell.textContent()
      
      expect(nameText.length).toBeGreaterThan(0)
      expect(slugText.length).toBeGreaterThan(0)
    })
  })

  // 3. ТЕСТИРОВАНИЕ РЕДАКТИРОВАНИЯ ИНФОРМАЦИИ О СТАТУСАХ
  test.describe('Редактирование информации о статусах', () => {
    test('форма редактирования статуса отображается правильно', async () => {
      // Создаем статус для редактирования
      const originalName = `Status to Edit ${Date.now()}`
      const originalSlug = `status-to-edit-${Date.now()}`
      
      await statusesPage.clickCreateStatus()
      await statusesPage.fillStatusForm(originalName, originalSlug)
      await statusesPage.saveStatusForm()
      await statusesPage.waitForPageLoaded()
      
      // Убедиться, что форма редактирования статуса отображается правильно
      await statusesPage.clickEditForStatus(originalName)
      
      // Проверяем что форма открылась с текущими данными
      await expect(statusesPage.nameInput).toHaveValue(originalName)
      await expect(statusesPage.slugInput).toHaveValue(originalSlug)
      await expect(statusesPage.saveButton).toBeVisible()
    })

    test('изменения данных статуса сохраняются корректно', async () => {
      // Создаем статус для редактирования
      const originalName = `Original Status ${Date.now()}`
      const originalSlug = `original-status-${Date.now()}`
      
      await statusesPage.clickCreateStatus()
      await statusesPage.fillStatusForm(originalName, originalSlug)
      await statusesPage.saveStatusForm()
      await statusesPage.waitForPageLoaded()
      
      // Изменить данные пользователя и убедиться, что изменения сохраняются корректно
      const updatedName = `Updated Status ${Date.now()}`
      const updatedSlug = `updated-status-${Date.now()}`
      
      await statusesPage.clickEditForStatus(originalName)
      await statusesPage.fillStatusForm(updatedName, updatedSlug)
      await statusesPage.saveStatusForm()
      
      // Проверяем что изменения сохранились
      await statusesPage.waitForPageLoaded()
      await statusesPage.verifyStatusInTable(updatedName, updatedSlug)
      await statusesPage.verifyStatusNotInTable(originalName)
    })

    test('валидация данных при редактировании статуса', async () => {
      // Создаем статус для тестирования валидации
      const testName = `Validation Test ${Date.now()}`
      const testSlug = `validation-test-${Date.now()}`
      
      await statusesPage.clickCreateStatus()
      await statusesPage.fillStatusForm(testName, testSlug)
      await statusesPage.saveStatusForm()
      await statusesPage.waitForPageLoaded()
      
      // Проверить валидацию данных при редактировании
      await statusesPage.clickEditForStatus(testName)
      
      // Пытаемся сохранить с пустым названием
      await statusesPage.nameInput.clear()
      await statusesPage.saveStatusForm()
      
      // Должна быть ошибка валидации
      await statusesPage.verifyFormValidation()
      
      // Возвращаемся и проверяем что оригинальные данные не изменились
      await statusesPage.page.goBack()
      await statusesPage.waitForPageLoaded()
      await statusesPage.verifyStatusInTable(testName, testSlug)
    })
  })

  // 4. ТЕСТИРОВАНИЕ ВОЗМОЖНОСТИ УДАЛЕНИЯ СТАТУСОВ
  test.describe('Удаление статусов', () => {
    test('удаление одного статуса', async () => {
      // Выбрать одного или нескольких пользователей для удаления
      const statusToDelete = `Status to Delete ${Date.now()}`
      const slugToDelete = `status-to-delete-${Date.now()}`
      
      await statusesPage.clickCreateStatus()
      await statusesPage.fillStatusForm(statusToDelete, slugToDelete)
      await statusesPage.saveStatusForm()
      await statusesPage.waitForPageLoaded()
      
      const countBefore = await statusesPage.page.locator('tbody tr').count()
      
      // Удаляем статус
      await statusesPage.clickDeleteForStatus(statusToDelete)
      await statusesPage.confirmDelete()
      
      // Убедиться, что после подтверждения удаления статусы удаляются
      await statusesPage.waitForPageLoaded()
      await statusesPage.verifyStatusNotInTable(statusToDelete)
      
      const countAfter = await statusesPage.page.locator('tbody tr').count()
      expect(countAfter).toBe(countBefore - 1)
    })
  })

  // 5. ТЕСТИРОВАНИЕ МАССОВОГО УДАЛЕНИЯ СТАТУСОВ
  test.describe('Массовое удаление статусов', () => {
    test('массовое удаление статусов', async () => {
      // Создаем несколько статусов для массового удаления
      const statusesToCreate = [
        { name: `Mass Delete 1 ${Date.now()}`, slug: `mass-delete-1-${Date.now()}` },
        { name: `Mass Delete 2 ${Date.now()}`, slug: `mass-delete-2-${Date.now()}` }
      ]
      
      for (const status of statusesToCreate) {
        await statusesPage.clickCreateStatus()
        await statusesPage.fillStatusForm(status.name, status.slug)
        await statusesPage.saveStatusForm()
        await statusesPage.waitForPageLoaded()
      }
      
      const countBefore = await statusesPage.page.locator('tbody tr').count()
      
      // Выбрать опцию для выделения всех статусов
      await statusesPage.selectAllStatuses()
      
      // Убедиться, что все статусы выделены
      const selectedCount = await statusesPage.page.locator('tbody input[type="checkbox"]:checked').count()
      expect(selectedCount).toBe(countBefore)
      
      // Выбрать опцию для удаления всех выбранных статусов
      await statusesPage.clickBulkDelete()
      await statusesPage.confirmDelete()
      
      // Убедиться, что они успешно удалены
      await statusesPage.waitForPageLoaded()
      
      for (const status of statusesToCreate) {
        await statusesPage.verifyStatusNotInTable(status.name)
      }
      
      const countAfter = await statusesPage.page.locator('tbody tr').count()
      expect(countAfter).toBeLessThan(countBefore)
    })
  })
})