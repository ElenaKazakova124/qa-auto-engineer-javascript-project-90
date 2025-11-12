const { test, expect } = require('@playwright/test')
const LoginPage = require('../pages/LoginPage.js')
const DashboardPage = require('./pages/DashboardPage.js')
const LabelsPage = require('./pages/LabelsPage.js')

test.describe('Тестирование меток по требованиям', () => {
  let loginPage, dashboardPage, labelsPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    dashboardPage = new DashboardPage(page)
    labelsPage = new LabelsPage(page)
    
    // Авторизация и переход к меткам
    await loginPage.goto()
    await loginPage.login('admin', 'admin')
    await dashboardPage.waitForPageLoaded()
    await dashboardPage.openLabelsList()
    await labelsPage.waitForPageLoaded()
  })

  // 1. ТЕСТИРОВАНИЕ СОЗДАНИЯ НОВЫХ МЕТОК
  test('создание новой метки', async () => {
    const labelName = `Новая метка ${Date.now()}`
    
    // Нажимаем создать
    await labelsPage.clickCreateLabel()
    
    // Заполняем форму
    await labelsPage.fillLabelForm(labelName)
    await labelsPage.saveLabelForm()
    
    // Проверяем что метка создана
    await labelsPage.waitForPageLoaded()
    await labelsPage.verifyLabelInTable(labelName)
  })

  test('форма создания метки отображается корректно', async () => {
    await labelsPage.clickCreateLabel()
    
    // Проверяем элементы формы
    await expect(labelsPage.nameInput).toBeVisible()
    await expect(labelsPage.saveButton).toBeVisible()
    await expect(labelsPage.page.getByText('Name*')).toBeVisible()
  })

  // 2. ТЕСТИРОВАНИЕ ПРОСМОТРА СПИСКА МЕТОК
  test('список меток отображается полностью', async () => {
    await expect(labelsPage.header).toBeVisible()
    
    // Проверяем что таблица не пустая
    const rows = await labelsPage.page.locator('tbody tr').count()
    expect(rows).toBeGreaterThan(0)
  })

  test('отображается основная информация о метках', async () => {
    // Проверяем заголовки таблицы
    const headers = ['Name', 'Created at']
    for (const header of headers) {
      await expect(labelsPage.page.getByText(header)).toBeVisible()
    }
    
    // Проверяем что есть метки с названиями
    const firstRow = labelsPage.page.locator('tbody tr').first()
    const nameCell = firstRow.locator('td').nth(0)
    await expect(nameCell).not.toBeEmpty()
  })

  // 3. ТЕСТИРОВАНИЕ РЕДАКТИРОВАНИЯ МЕТОК
  test('редактирование метки', async () => {
    // Создаем метку для редактирования
    const originalName = `Метка для редактирования ${Date.now()}`
    
    await labelsPage.clickCreateLabel()
    await labelsPage.fillLabelForm(originalName)
    await labelsPage.saveLabelForm()
    await labelsPage.waitForPageLoaded()
    
    // Редактируем метку
    const updatedName = `Обновленная метка ${Date.now()}`
    
    await labelsPage.clickEditForLabel(originalName)
    await labelsPage.fillLabelForm(updatedName)
    await labelsPage.saveLabelForm()
    
    // Проверяем изменения
    await labelsPage.waitForPageLoaded()
    await labelsPage.verifyLabelInTable(updatedName)
  })

  test('валидация при редактировании', async () => {
    // Создаем метку для тестирования валидации
    const testName = `Тест валидации ${Date.now()}`
    
    await labelsPage.clickCreateLabel()
    await labelsPage.fillLabelForm(testName)
    await labelsPage.saveLabelForm()
    await labelsPage.waitForPageLoaded()
    
    // Пытаемся сохранить с пустым названием
    await labelsPage.clickEditForLabel(testName)
    await labelsPage.nameInput.clear()
    await labelsPage.saveLabelForm()
    
    // Должна быть ошибка валидации
    await labelsPage.verifyFormValidation()
  })

  // 4. ТЕСТИРОВАНИЕ УДАЛЕНИЯ МЕТОК
  test('удаление метки', async () => {
    // Создаем метку для удаления
    const labelToDelete = `Метка для удаления ${Date.now()}`
    
    await labelsPage.clickCreateLabel()
    await labelsPage.fillLabelForm(labelToDelete)
    await labelsPage.saveLabelForm()
    await labelsPage.waitForPageLoaded()
    
    const countBefore = await labelsPage.page.locator('tbody tr').count()
    
    // Удаляем метку
    await labelsPage.clickDeleteForLabel(labelToDelete)
    await labelsPage.confirmDelete()
    
    // Проверяем что метка удалена
    await labelsPage.waitForPageLoaded()
    await labelsPage.verifyLabelNotInTable(labelToDelete)
    
    const countAfter = await labelsPage.page.locator('tbody tr').count()
    expect(countAfter).toBe(countBefore - 1)
  })

  // 5. ТЕСТИРОВАНИЕ МАССОВОГО УДАЛЕНИЯ
  test('массовое удаление меток', async () => {
    // Создаем несколько меток
    const labelsToCreate = [
      `Массовая метка 1 ${Date.now()}`,
      `Массовая метка 2 ${Date.now()}`
    ]
    
    for (const labelName of labelsToCreate) {
      await labelsPage.clickCreateLabel()
      await labelsPage.fillLabelForm(labelName)
      await labelsPage.saveLabelForm()
      await labelsPage.waitForPageLoaded()
    }
    
    const countBefore = await labelsPage.page.locator('tbody tr').count()
    
    // Выделяем все метки
    await labelsPage.selectAllLabels()
    
    // Удаляем выделенные
    await labelsPage.clickBulkDelete()
    await labelsPage.confirmDelete()
    
    // Проверяем что метки удалены
    await labelsPage.waitForPageLoaded()
    
    for (const labelName of labelsToCreate) {
      await labelsPage.verifyLabelNotInTable(labelName)
    }
    
    const countAfter = await labelsPage.page.locator('tbody tr').count()
    expect(countAfter).toBeLessThan(countBefore)
  })
})