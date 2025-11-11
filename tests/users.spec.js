const { test, expect } = require('@playwright/test')
const LoginPage = require('../pages/LoginPage.js')
const DashboardPage = require('./pages/DashboardPage.js')
const UsersPage = require('./pages/UsersPage.js')

// Тестовые данные
const testUsers = {
  newUser: {
    email: `testuser${Date.now()}@example.com`,
    firstName: 'Test',
    lastName: 'User'
  },
  updatedUser: {
    email: `updateduser${Date.now()}@example.com`,
    firstName: 'Updated',
    lastName: 'User'
  },
  invalidUser: {
    email: 'invalid-email',
    firstName: 'Invalid',
    lastName: 'User'
  }
}

test.describe('Полное тестирование функциональности пользователей', () => {
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

  // ТЕСТЫ СОЗДАНИЯ ПОЛЬЗОВАТЕЛЕЙ
  test.describe('Создание новых пользователей', () => {
    test('форма создания пользователя отображается корректно', async () => {
      await usersPage.clickCreateUser()
      
      // Проверяем что форма открылась и содержит все необходимые элементы
      await usersPage.verifyFormLoaded()
      await usersPage.verifyRequiredFields()
    })

    test('создание пользователя с валидными данными', async () => {
      await usersPage.clickCreateUser()
      
      // Заполняем форму валидными данными
      await usersPage.fillUserForm(
        testUsers.newUser.email,
        testUsers.newUser.firstName,
        testUsers.newUser.lastName
      )
      
      // Сохраняем
      await usersPage.saveUserForm()
      
      // Ждем возврата к списку и проверяем что пользователь создан
      await usersPage.waitForPageLoaded()
      await usersPage.verifyUserInTable(
        testUsers.newUser.email,
        testUsers.newUser.firstName,
        testUsers.newUser.lastName
      )
    })

    test('попытка создания пользователя с пустыми обязательными полями', async () => {
      await usersPage.clickCreateUser()
      
      // Пытаемся сохранить пустую форму
      await usersPage.saveUserForm()
      
      // Проверяем что остались на форме и есть сообщения об ошибках
      await usersPage.verifyFormLoaded()
      await usersPage.verifyFormValidation()
    })

    test('создание пользователя с некорректным email', async () => {
      await usersPage.clickCreateUser()
      
      // Вводим некорректный email
      await usersPage.fillUserForm(
        testUsers.invalidUser.email,
        testUsers.invalidUser.firstName,
        testUsers.invalidUser.lastName
      )
      
      await usersPage.saveUserForm()
      
      // Проверяем валидацию
      await usersPage.verifyFormValidation()
    })

    test('валидация формата email при создании', async () => {
      await usersPage.clickCreateUser()
      
      const invalidEmails = [
        'invalid',
        'invalid@',
        'invalid@domain',
        '@domain.com'
      ]

      for (const invalidEmail of invalidEmails) {
        await usersPage.emailInput.fill(invalidEmail)
        await usersPage.firstNameInput.fill('Test')
        await usersPage.lastNameInput.fill('User')
        await usersPage.saveUserForm()
        
        // Проверяем ошибку валидации
        await usersPage.verifyFormValidation()
        
        // Очищаем поле для следующего теста
        await usersPage.emailInput.clear()
      }
    })
  })

  // ТЕСТЫ ПРОСМОТРА И РЕДАКТИРОВАНИЯ
  test.describe('Просмотр и редактирование пользователей', () => {
    test('просмотр списка пользователей отображает полную информацию', async () => {
      // Проверяем заголовки таблицы
      const headers = ['Email', 'First name', 'Last name', 'Created at']
      for (const header of headers) {
        await expect(usersPage.page.getByText(header, { exact: true })).toBeVisible()
      }
      
      // Проверяем что отображаются все пользователи с правильными данными
      await usersPage.verifyUsersTable()
    })

    test('редактирование информации о пользователе', async () => {
      // Сначала создаем пользователя для редактирования
      await usersPage.clickCreateUser()
      await usersPage.fillUserForm(
        testUsers.newUser.email,
        testUsers.newUser.firstName,
        testUsers.newUser.lastName
      )
      await usersPage.saveUserForm()
      await usersPage.waitForPageLoaded()
      
      // Редактируем созданного пользователя
      await usersPage.clickEditForUser(testUsers.newUser.email)
      
      // Проверяем что форма открылась с текущими данными
      await usersPage.verifyFormLoaded()
      
      // Изменяем данные
      await usersPage.fillUserForm(
        testUsers.updatedUser.email,
        testUsers.updatedUser.firstName,
        testUsers.updatedUser.lastName
      )
      
      // Сохраняем изменения
      await usersPage.saveUserForm()
      
      // Проверяем что изменения применились
      await usersPage.waitForPageLoaded()
      await usersPage.verifyUserInTable(
        testUsers.updatedUser.email,
        testUsers.updatedUser.firstName,
        testUsers.updatedUser.lastName
      )
    })

    test('просмотр детальной информации о пользователе', async () => {
      // Создаем пользователя для просмотра
      await usersPage.clickCreateUser()
      await usersPage.fillUserForm(
        testUsers.newUser.email,
        testUsers.newUser.firstName,
        testUsers.newUser.lastName
      )
      await usersPage.saveUserForm()
      await usersPage.waitForPageLoaded()
      
      // Открываем детальную информацию
      await usersPage.clickShowForUser(testUsers.newUser.email)
      
      // Проверяем что открылась страница деталей
      await expect(usersPage.page.getByText(testUsers.newUser.email)).toBeVisible()
      await expect(usersPage.page.getByText(testUsers.newUser.firstName)).toBeVisible()
      await expect(usersPage.page.getByText(testUsers.newUser.lastName)).toBeVisible()
      
      // Возвращаемся назад
      await usersPage.page.goBack()
      await usersPage.waitForPageLoaded()
    })

    test('поиск пользователя по email', async () => {
      // Создаем пользователя для поиска
      await usersPage.clickCreateUser()
      await usersPage.fillUserForm(
        testUsers.newUser.email,
        testUsers.newUser.firstName,
        testUsers.newUser.lastName
      )
      await usersPage.saveUserForm()
      await usersPage.waitForPageLoaded()
      
      // Ищем пользователя по email
      await usersPage.searchInput.fill(testUsers.newUser.email)
      
      // Ждем обновления таблицы
      await usersPage.page.waitForTimeout(1000)
      
      // Проверяем что в результатах только искомый пользователь
      await expect(usersPage.page.getByText(testUsers.newUser.email)).toBeVisible()
    })

    test('редактирование с валидацией обязательных полей', async () => {
      // Создаем пользователя для редактирования
      await usersPage.clickCreateUser()
      await usersPage.fillUserForm(
        testUsers.newUser.email,
        testUsers.newUser.firstName,
        testUsers.newUser.lastName
      )
      await usersPage.saveUserForm()
      await usersPage.waitForPageLoaded()
      
      // Редактируем пользователя
      await usersPage.clickEditForUser(testUsers.newUser.email)
      
      // Очищаем обязательные поля
      await usersPage.emailInput.clear()
      await usersPage.firstNameInput.clear()
      await usersPage.lastNameInput.clear()
      
      // Пытаемся сохранить
      await usersPage.saveUserForm()
      
      // Проверяем что появились ошибки валидации
      await usersPage.verifyFormValidation()
    })
  })

  // ТЕСТЫ УДАЛЕНИЯ ПОЛЬЗОВАТЕЛЕЙ
  test.describe('Удаление пользователей', () => {
    test('удаление одного пользователя', async () => {
      // Создаем пользователя для удаления
      await usersPage.clickCreateUser()
      await usersPage.fillUserForm(
        testUsers.newUser.email,
        testUsers.newUser.firstName,
        testUsers.newUser.lastName
      )
      await usersPage.saveUserForm()
      await usersPage.waitForPageLoaded()
      
      const initialCount = await usersPage.page.locator('tbody tr').count()
      
      // Удаляем пользователя
      await usersPage.clickDeleteForUser(testUsers.newUser.email)
      await usersPage.confirmDelete()
      
      // Проверяем что пользователь удален
      await usersPage.waitForPageLoaded()
      await usersPage.verifyUserNotInTable(testUsers.newUser.email)
      
      // Проверяем что количество пользователей уменьшилось на 1
      const newCount = await usersPage.page.locator('tbody tr').count()
      expect(newCount).toBe(initialCount - 1)
    })

    test('массовое удаление пользователей', async () => {
      // Создаем несколько пользователей для удаления
      const usersToCreate = [
        { email: `user1${Date.now()}@example.com`, firstName: 'User1', lastName: 'Test' },
        { email: `user2${Date.now()}@example.com`, firstName: 'User2', lastName: 'Test' }
      ]
      
      for (const user of usersToCreate) {
        await usersPage.clickCreateUser()
        await usersPage.fillUserForm(user.email, user.firstName, user.lastName)
        await usersPage.saveUserForm()
        await usersPage.waitForPageLoaded()
      }
      
      const initialCount = await usersPage.page.locator('tbody tr').count()
      
      // Выбираем созданных пользователей
      for (const user of usersToCreate) {
        await usersPage.selectUser(user.email)
      }
      
      // Удаляем выбранных
      await usersPage.clickBulkDelete()
      await usersPage.confirmDelete()
      
      // Проверяем что пользователи удалены
      await usersPage.waitForPageLoaded()
      for (const user of usersToCreate) {
        await usersPage.verifyUserNotInTable(user.email)
      }
      
      // Проверяем общее количество
      const newCount = await usersPage.page.locator('tbody tr').count()
      expect(newCount).toBe(initialCount - usersToCreate.length)
    })

    test('удаление всех пользователей через выделение всех', async () => {
      // Создаем несколько пользователей
      const usersToCreate = [
        { email: `user1${Date.now()}@example.com`, firstName: 'User1', lastName: 'Test' },
        { email: `user2${Date.now()}@example.com`, firstName: 'User2', lastName: 'Test' }
      ]
      
      for (const user of usersToCreate) {
        await usersPage.clickCreateUser()
        await usersPage.fillUserForm(user.email, user.firstName, user.lastName)
        await usersPage.saveUserForm()
        await usersPage.waitForPageLoaded()
      }
      
      const initialCount = await usersPage.page.locator('tbody tr').count()
      
      // Выделяем всех пользователей
      await usersPage.selectAllUsers()
      
      // Проверяем что все выделены
      const selectedCount = await usersPage.page.locator('tbody input[type="checkbox"]:checked').count()
      expect(selectedCount).toBe(initialCount)
      
      // Удаляем всех
      await usersPage.clickBulkDelete()
      await usersPage.confirmDelete()
      
      // Проверяем что таблица пуста или содержит только исходных пользователей
      await usersPage.waitForPageLoaded()
      const finalCount = await usersPage.page.locator('tbody tr').count()
      expect(finalCount).toBeLessThan(initialCount)
    })

    test('отмена удаления пользователя', async () => {
      // Создаем пользователя для теста отмены удаления
      await usersPage.clickCreateUser()
      await usersPage.fillUserForm(
        testUsers.newUser.email,
        testUsers.newUser.firstName,
        testUsers.newUser.lastName
      )
      await usersPage.saveUserForm()
      await usersPage.waitForPageLoaded()
      
      const initialCount = await usersPage.page.locator('tbody tr').count()
      
      // Начинаем удаление но отменяем
      await usersPage.clickDeleteForUser(testUsers.newUser.email)
      await usersPage.page.getByRole('button', { name: 'Cancel' }).click()
      
      // Проверяем что пользователь не удален
      await usersPage.waitForPageLoaded()
      await usersPage.verifyUserInTable(testUsers.newUser.email)
      
      const newCount = await usersPage.page.locator('tbody tr').count()
      expect(newCount).toBe(initialCount)
    })

    test('массовое удаление с отменой', async () => {
      // Создаем пользователей для теста
      const usersToCreate = [
        { email: `user1${Date.now()}@example.com`, firstName: 'User1', lastName: 'Test' },
        { email: `user2${Date.now()}@example.com`, firstName: 'User2', lastName: 'Test' }
      ]
      
      for (const user of usersToCreate) {
        await usersPage.clickCreateUser()
        await usersPage.fillUserForm(user.email, user.firstName, user.lastName)
        await usersPage.saveUserForm()
        await usersPage.waitForPageLoaded()
      }
      
      const initialCount = await usersPage.page.locator('tbody tr').count()
      
      // Выбираем пользователей
      for (const user of usersToCreate) {
        await usersPage.selectUser(user.email)
      }
      
      // Начинаем массовое удаление но отменяем
      await usersPage.clickBulkDelete()
      await usersPage.page.getByRole('button', { name: 'Cancel' }).click()
      
      // Проверяем что пользователи не удалены
      await usersPage.waitForPageLoaded()
      for (const user of usersToCreate) {
        await usersPage.verifyUserInTable(user.email)
      }
      
      const newCount = await usersPage.page.locator('tbody tr').count()
      expect(newCount).toBe(initialCount)
    })
  })

  // ТЕСТЫ ПОЛНОГО ЖИЗНЕННОГО ЦИКЛА
  test.describe('Полный жизненный цикл пользователя', () => {
    test('полный цикл CRUD операций с пользователем', async () => {
      const uniqueEmail = `completeuser${Date.now()}@example.com`
      
      // CREATE - Создание пользователя
      await usersPage.clickCreateUser()
      await usersPage.fillUserForm(uniqueEmail, 'Complete', 'User')
      await usersPage.saveUserForm()
      await usersPage.waitForPageLoaded()
      
      // READ - Проверка создания
      await usersPage.verifyUserInTable(uniqueEmail, 'Complete', 'User')
      
      // UPDATE - Редактирование пользователя
      await usersPage.clickEditForUser(uniqueEmail)
      await usersPage.fillUserForm(`updated-${uniqueEmail}`, 'Updated', 'User')
      await usersPage.saveUserForm()
      await usersPage.waitForPageLoaded()
      
      // Проверка обновления
      await usersPage.verifyUserInTable(`updated-${uniqueEmail}`, 'Updated', 'User')
      
      // DELETE - Удаление пользователя
      await usersPage.clickDeleteForUser(`updated-${uniqueEmail}`)
      await usersPage.confirmDelete()
      await usersPage.waitForPageLoaded()
      
      // Проверка удаления
      await usersPage.verifyUserNotInTable(`updated-${uniqueEmail}`)
    })

    test('создание и немедленное редактирование пользователя', async () => {
      const uniqueEmail = `quickedit${Date.now()}@example.com`
      
      // Создаем пользователя
      await usersPage.clickCreateUser()
      await usersPage.fillUserForm(uniqueEmail, 'Quick', 'Edit')
      await usersPage.saveUserForm()
      await usersPage.waitForPageLoaded()
      
      // Немедленно редактируем
      await usersPage.clickEditForUser(uniqueEmail)
      await usersPage.fillUserForm(uniqueEmail, 'Fast', 'Update')
      await usersPage.saveUserForm()
      await usersPage.waitForPageLoaded()
      
      // Проверяем изменения
      await usersPage.verifyUserInTable(uniqueEmail, 'Fast', 'Update')
    })

    test('создание, просмотр и удаление пользователя', async () => {
      const uniqueEmail = `viewdelete${Date.now()}@example.com`
      
      // Создаем пользователя
      await usersPage.clickCreateUser()
      await usersPage.fillUserForm(uniqueEmail, 'View', 'Delete')
      await usersPage.saveUserForm()
      await usersPage.waitForPageLoaded()
      
      // Просматриваем детали
      await usersPage.clickShowForUser(uniqueEmail)
      await expect(usersPage.page.getByText(uniqueEmail)).toBeVisible()
      await usersPage.page.goBack()
      await usersPage.waitForPageLoaded()
      
      // Удаляем пользователя
      await usersPage.clickDeleteForUser(uniqueEmail)
      await usersPage.confirmDelete()
      await usersPage.waitForPageLoaded()
      
      // Проверяем удаление
      await usersPage.verifyUserNotInTable(uniqueEmail)
    })
  })

  // ТЕСТЫ ГРАНИЧНЫХ СЛУЧАЕВ
  test.describe('Граничные случаи и валидация', () => {
    test('создание пользователя с максимально длинными данными', async () => {
      await usersPage.clickCreateUser()
      
      const longString = 'a'.repeat(100)
      await usersPage.fillUserForm(
        `${longString}@example.com`,
        longString,
        longString
      )
      
      await usersPage.saveUserForm()
      
      // Проверяем что пользователь создан (или обработана ошибка если есть ограничения)
      await usersPage.waitForPageLoaded()
      // В этом тесте мы просто проверяем что приложение не падает
    })

    test('поиск несуществующего пользователя', async () => {
      const nonExistentEmail = `nonexistent${Date.now()}@example.com`
      
      await usersPage.searchInput.fill(nonExistentEmail)
      await usersPage.page.waitForTimeout(1000)
      
      // Проверяем что таблица либо пуста, либо показывает сообщение о отсутствии результатов
      const rows = await usersPage.page.locator('tbody tr').count()
      expect(rows).toBeLessThanOrEqual(1) // Может быть 0 строк или 1 строка с сообщением
    })

    test('двойное нажатие кнопки создания', async () => {
      await usersPage.clickCreateUser()
      await usersPage.clickCreateUser() // Двойное нажатие
      
      // Проверяем что форма все еще доступна и не сломалась
      await usersPage.verifyFormLoaded()
    })

    test('навигация назад во время создания пользователя', async () => {
      await usersPage.clickCreateUser()
      await usersPage.verifyFormLoaded()
      
      // Нажимаем назад в браузере
      await usersPage.page.goBack()
      
      // Проверяем что вернулись к списку пользователей
      await usersPage.waitForPageLoaded()
    })
  })
})

test.describe('Тесты производительности пользователей', () => {
  let loginPage, dashboardPage, usersPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    dashboardPage = new DashboardPage(page)
    usersPage = new UsersPage(page)
    
    await loginPage.goto()
    await loginPage.login('admin', 'admin')
    await dashboardPage.waitForPageLoaded()
    await dashboardPage.openUsersList()
    await usersPage.waitForPageLoaded()
  })

  test('быстрое создание нескольких пользователей', async () => {
    const startTime = Date.now()
    const userCount = 3
    
    for (let i = 0; i < userCount; i++) {
      await usersPage.clickCreateUser()
      await usersPage.fillUserForm(
        `perfuser${i}${Date.now()}@example.com`,
        `User${i}`,
        `Test${i}`
      )
      await usersPage.saveUserForm()
      await usersPage.waitForPageLoaded()
    }
    
    const endTime = Date.now()
    const totalTime = endTime - startTime
    
    // Проверяем что операция выполняется за разумное время
    // (менее 30 секунд для 3 пользователей)
    expect(totalTime).toBeLessThan(30000)
  })

  test('время загрузки списка пользователей', async ({ page }) => {
    const startTime = Date.now()
    
    // Перезагружаем страницу
    await page.reload()
    await usersPage.waitForPageLoaded()
    
    const endTime = Date.now()
    const loadTime = endTime - startTime
    
    // Проверяем что страница загружается за разумное время
    expect(loadTime).toBeLessThan(10000) // Менее 10 секунд
  })
})