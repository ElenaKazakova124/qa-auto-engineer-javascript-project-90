const { test, expect } = require('@playwright/test')
const LoginPage = require('../pages/LoginPage.js')
const DashboardPage = require('./pages/DashboardPage.js')
const UsersPage = require('./pages/UsersPage.js')

test.describe('Тестирование пользователей по требованиям', () => {
  let loginPage, dashboardPage, usersPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    dashboardPage = new DashboardPage(page)
    usersPage = new UsersPage(page)
    
    // Авторизация и переход к пользователям
    await loginPage.goto()
    await loginPage.login('admin', 'admin')
    await dashboardPage.waitForPageLoaded()
    await dashboardPage.openUsersList()
    await usersPage.waitForPageLoaded()
  })

  // 1. ТЕСТИРОВАНИЕ СОЗДАНИЯ НОВЫХ ПОЛЬЗОВАТЕЛЕЙ
  test.describe('Создание новых пользователей', () => {
    test('форма создания пользователя отображается корректно', async () => {
      // Убедиться, что форма создания пользователя отображается корректно
      await usersPage.clickCreateUser()
      
      // Проверяем все элементы формы
      await expect(usersPage.emailInput).toBeVisible()
      await expect(usersPage.firstNameInput).toBeVisible()
      await expect(usersPage.lastNameInput).toBeVisible()
      await expect(usersPage.saveButton).toBeVisible()
      
      // Проверяем обязательные поля
      await expect(usersPage.page.getByText('Email*')).toBeVisible()
      await expect(usersPage.page.getByText('First name*')).toBeVisible()
      await expect(usersPage.page.getByText('Last name*')).toBeVisible()
    })

    test('данные нового пользователя сохраняются правильно', async () => {
      // Ввести данные нового пользователя в форму и убедиться, что данные сохраняются правильно
      const testEmail = `testuser${Date.now()}@example.com`
      const testFirstName = `FirstName${Date.now()}`
      const testLastName = `LastName${Date.now()}`
      
      await usersPage.clickCreateUser()
      await usersPage.fillUserForm(testEmail, testFirstName, testLastName)
      await usersPage.saveUserForm()
      
      // Проверяем что сохранились правильные данные
      await usersPage.waitForPageLoaded()
      await usersPage.verifyUserInTable(testEmail, testFirstName, testLastName)
    })
  })

  // 2. ТЕСТИРОВАНИЕ ПРОСМОТРА СПИСКА ПОЛЬЗОВАТЕЛЕЙ
  test.describe('Просмотр списка пользователей', () => {
    test('список пользователей отображается полностью и корректно', async () => {
      // Убедиться, что список пользователей отображается полностью и корректно
      await expect(usersPage.header).toBeVisible()
      
      // Проверяем что таблица не пустая
      const rows = await usersPage.page.locator('tbody tr').count()
      expect(rows).toBeGreaterThan(0)
      
      // Проверяем заголовки таблицы
      const headers = ['Email', 'First name', 'Last name', 'Created at']
      for (const header of headers) {
        await expect(usersPage.page.getByText(header)).toBeVisible()
      }
    })

    test('отображается основная информация о каждом пользователе', async () => {
      // Проверить, что отображается основная информация о каждом пользователе: электронная почта, имя и фамилия
      const firstRow = usersPage.page.locator('tbody tr').first()
      
      // Проверяем что в каждой строке есть email, имя и фамилия
      const emailCell = firstRow.locator('td').nth(0) // Первая колонка - Email
      const firstNameCell = firstRow.locator('td').nth(1) // Вторая колонка - First name
      const lastNameCell = firstRow.locator('td').nth(2) // Третья колонка - Last name
      
      await expect(emailCell).not.toBeEmpty()
      await expect(firstNameCell).not.toBeEmpty()
      await expect(lastNameCell).not.toBeEmpty()
      
      const emailText = await emailCell.textContent()
      const firstNameText = await firstNameCell.textContent()
      const lastNameText = await lastNameCell.textContent()
      
      expect(emailText.length).toBeGreaterThan(0)
      expect(firstNameText.length).toBeGreaterThan(0)
      expect(lastNameText.length).toBeGreaterThan(0)
      
      // Проверяем что email содержит @ (базовая проверка формата)
      expect(emailText).toContain('@')
    })
  })

  // 3. ТЕСТИРОВАНИЕ РЕДАКТИРОВАНИЯ ИНФОРМАЦИИ О ПОЛЬЗОВАТЕЛЯХ
  test.describe('Редактирование информации о пользователях', () => {
    test('форма редактирования пользователя отображается правильно', async () => {
      // Создаем пользователя для редактирования
      const originalEmail = `edituser${Date.now()}@example.com`
      const originalFirstName = `OriginalFirst${Date.now()}`
      const originalLastName = `OriginalLast${Date.now()}`
      
      await usersPage.clickCreateUser()
      await usersPage.fillUserForm(originalEmail, originalFirstName, originalLastName)
      await usersPage.saveUserForm()
      await usersPage.waitForPageLoaded()
      
      // Убедиться, что форма редактирования пользователя отображается правильно
      await usersPage.clickEditForUser(originalEmail)
      
      // Проверяем что форма открылась с текущими данными
      await expect(usersPage.emailInput).toHaveValue(originalEmail)
      await expect(usersPage.firstNameInput).toHaveValue(originalFirstName)
      await expect(usersPage.lastNameInput).toHaveValue(originalLastName)
      await expect(usersPage.saveButton).toBeVisible()
    })

    test('изменения данных пользователя сохраняются корректно', async () => {
      // Создаем пользователя для редактирования
      const originalEmail = `original${Date.now()}@example.com`
      const originalFirstName = `OriginalFirst${Date.now()}`
      const originalLastName = `OriginalLast${Date.now()}`
      
      await usersPage.clickCreateUser()
      await usersPage.fillUserForm(originalEmail, originalFirstName, originalLastName)
      await usersPage.saveUserForm()
      await usersPage.waitForPageLoaded()
      
      // Изменить данные пользователя и убедиться, что изменения сохраняются корректно
      const updatedEmail = `updated${Date.now()}@example.com`
      const updatedFirstName = `UpdatedFirst${Date.now()}`
      const updatedLastName = `UpdatedLast${Date.now()}`
      
      await usersPage.clickEditForUser(originalEmail)
      await usersPage.fillUserForm(updatedEmail, updatedFirstName, updatedLastName)
      await usersPage.saveUserForm()
      
      // Проверяем что изменения сохранились
      await usersPage.waitForPageLoaded()
      await usersPage.verifyUserInTable(updatedEmail, updatedFirstName, updatedLastName)
      await usersPage.verifyUserNotInTable(originalEmail)
    })

    test('валидация данных при редактировании пользователя', async () => {
      // Создаем пользователя для тестирования валидации
      const testEmail = `validation${Date.now()}@example.com`
      const testFirstName = `ValidationFirst${Date.now()}`
      const testLastName = `ValidationLast${Date.now()}`
      
      await usersPage.clickCreateUser()
      await usersPage.fillUserForm(testEmail, testFirstName, testLastName)
      await usersPage.saveUserForm()
      await usersPage.waitForPageLoaded()
      
      // Проверить валидацию данных при редактировании пользователя
      await usersPage.clickEditForUser(testEmail)
      
      // Пытаемся сохранить с некорректным email
      await usersPage.emailInput.fill('invalid-email')
      await usersPage.saveUserForm()
      
      // Должна быть ошибка валидации email
      await usersPage.verifyFormValidation()
      
      // Возвращаемся и проверяем что оригинальные данные не изменились
      await usersPage.page.goBack()
      await usersPage.waitForPageLoaded()
      await usersPage.verifyUserInTable(testEmail, testFirstName, testLastName)
    })

    test('валидация обязательных полей при редактировании', async () => {
      // Создаем пользователя для тестирования валидации обязательных полей
      const testEmail = `required${Date.now()}@example.com`
      const testFirstName = `RequiredFirst${Date.now()}`
      const testLastName = `RequiredLast${Date.now()}`
      
      await usersPage.clickCreateUser()
      await usersPage.fillUserForm(testEmail, testFirstName, testLastName)
      await usersPage.saveUserForm()
      await usersPage.waitForPageLoaded()
      
      await usersPage.clickEditForUser(testEmail)
      
      // Очищаем обязательные поля
      await usersPage.emailInput.clear()
      await usersPage.firstNameInput.clear()
      await usersPage.lastNameInput.clear()
      await usersPage.saveUserForm()
      
      // Должны быть ошибки валидации
      await usersPage.verifyFormValidation()
    })
  })

  // 4. ТЕСТИРОВАНИЕ ВОЗМОЖНОСТИ УДАЛЕНИЯ ПОЛЬЗОВАТЕЛЕЙ
  test.describe('Удаление пользователей', () => {
    test('удаление одного пользователя', async () => {
      // Выбрать одного пользователя для удаления
      const userToDelete = `deleteuser${Date.now()}@example.com`
      const userFirstName = `DeleteFirst${Date.now()}`
      const userLastName = `DeleteLast${Date.now()}`
      
      await usersPage.clickCreateUser()
      await usersPage.fillUserForm(userToDelete, userFirstName, userLastName)
      await usersPage.saveUserForm()
      await usersPage.waitForPageLoaded()
      
      const countBefore = await usersPage.page.locator('tbody tr').count()
      
      // Удаляем пользователя
      await usersPage.clickDeleteForUser(userToDelete)
      await usersPage.confirmDelete()
      
      // Убедиться, что после подтверждения удаления пользователь удаляется
      await usersPage.waitForPageLoaded()
      await usersPage.verifyUserNotInTable(userToDelete)
      
      const countAfter = await usersPage.page.locator('tbody tr').count()
      expect(countAfter).toBe(countBefore - 1)
    })

    test('удаление нескольких пользователей', async () => {
      // Выбрать нескольких пользователей для удаления
      const usersToCreate = [
        { email: `multidelete1${Date.now()}@example.com`, firstName: 'Multi1', lastName: 'Delete1' },
        { email: `multidelete2${Date.now()}@example.com`, firstName: 'Multi2', lastName: 'Delete2' }
      ]
      
      for (const user of usersToCreate) {
        await usersPage.clickCreateUser()
        await usersPage.fillUserForm(user.email, user.firstName, user.lastName)
        await usersPage.saveUserForm()
        await usersPage.waitForPageLoaded()
      }
      
      const countBefore = await usersPage.page.locator('tbody tr').count()
      
      // Удаляем каждого пользователя по отдельности
      for (const user of usersToCreate) {
        await usersPage.clickDeleteForUser(user.email)
        await usersPage.confirmDelete()
        await usersPage.waitForPageLoaded()
      }
      
      // Проверяем что все пользователи удалены
      for (const user of usersToCreate) {
        await usersPage.verifyUserNotInTable(user.email)
      }
      
      const countAfter = await usersPage.page.locator('tbody tr').count()
      expect(countAfter).toBe(countBefore - usersToCreate.length)
    })
  })

  // 5. ТЕСТИРОВАНИЕ МАССОВОГО УДАЛЕНИЯ ПОЛЬЗОВАТЕЛЕЙ
  test.describe('Массовое удаление пользователей', () => {
    test('массовое удаление пользователей', async () => {
      // Создаем несколько пользователей для массового удаления
      const usersToCreate = [
        { email: `bulkdelete1${Date.now()}@example.com`, firstName: 'Bulk1', lastName: 'Delete1' },
        { email: `bulkdelete2${Date.now()}@example.com`, firstName: 'Bulk2', lastName: 'Delete2' },
        { email: `bulkdelete3${Date.now()}@example.com`, firstName: 'Bulk3', lastName: 'Delete3' }
      ]
      
      for (const user of usersToCreate) {
        await usersPage.clickCreateUser()
        await usersPage.fillUserForm(user.email, user.firstName, user.lastName)
        await usersPage.saveUserForm()
        await usersPage.waitForPageLoaded()
      }
      
      const countBefore = await usersPage.page.locator('tbody tr').count()
      
      // Выбрать опцию для выделения всех пользователей
      await usersPage.selectAllUsers()
      
      // Убедиться, что все пользователи выделены
      const selectedCount = await usersPage.page.locator('tbody input[type="checkbox"]:checked').count()
      expect(selectedCount).toBe(countBefore)
      
      // Выбрать опцию для удаления всех выбранных пользователей
      await usersPage.clickBulkDelete()
      await usersPage.confirmDelete()
      
      // Убедиться, что они успешно удалены
      await usersPage.waitForPageLoaded()
      
      for (const user of usersToCreate) {
        await usersPage.verifyUserNotInTable(user.email)
      }
      
      const countAfter = await usersPage.page.locator('tbody tr').count()
      expect(countAfter).toBeLessThan(countBefore)
    })

    test('массовое удаление с отменой', async () => {
      // Создаем пользователей для теста отмены
      const usersToCreate = [
        { email: `canceldelete1${Date.now()}@example.com`, firstName: 'Cancel1', lastName: 'Delete1' },
        { email: `canceldelete2${Date.now()}@example.com`, firstName: 'Cancel2', lastName: 'Delete2' }
      ]
      
      for (const user of usersToCreate) {
        await usersPage.clickCreateUser()
        await usersPage.fillUserForm(user.email, user.firstName, user.lastName)
        await usersPage.saveUserForm()
        await usersPage.waitForPageLoaded()
      }
      
      const countBefore = await usersPage.page.locator('tbody tr').count()
      
      // Выделяем всех
      await usersPage.selectAllUsers()
      
      // Начинаем массовое удаление но отменяем
      await usersPage.clickBulkDelete()
      await usersPage.page.getByRole('button', { name: 'Cancel' }).click()
      
      // Проверяем что пользователи не удалены
      await usersPage.waitForPageLoaded()
      for (const user of usersToCreate) {
        await usersPage.verifyUserInTable(user.email, user.firstName, user.lastName)
      }
      
      const countAfter = await usersPage.page.locator('tbody tr').count()
      expect(countAfter).toBe(countBefore)
    })
  })
})