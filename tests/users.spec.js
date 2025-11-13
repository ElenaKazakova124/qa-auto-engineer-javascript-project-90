import { test } from '@playwright/test'
import LoginPage from './pages/LoginPage.js'
import DashboardPage from './pages/DashboardPage.js'
import UsersPage from './pages/UsersPage.js'

test.describe('Пользователи', () => {
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

  test('создание пользователя', async () => {
    const email = usersPage.helpers.generateEmail()
    await usersPage.createUser(email, 'Test', 'User')
    await usersPage.shouldSee(email)
  })

  test('редактирование пользователя', async () => {
    const oldEmail = usersPage.helpers.generateEmail()
    const newEmail = usersPage.helpers.generateEmail()
    
    await usersPage.createUser(oldEmail, 'Old', 'Name')
    await usersPage.editUser(oldEmail, newEmail, 'New', 'Name')
    await usersPage.shouldSee(newEmail)
    await usersPage.shouldNotSee(oldEmail)
  })

  test('удаление пользователя', async () => {
    const email = usersPage.helpers.generateEmail()
    
    await usersPage.createUser(email, 'Delete', 'User')
    await usersPage.shouldSee(email)
    await usersPage.deleteUser(email)
    await usersPage.shouldNotSee(email)
  })
})