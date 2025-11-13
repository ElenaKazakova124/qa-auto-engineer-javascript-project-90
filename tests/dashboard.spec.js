import { test, expect } from '@playwright/test'
import Helpers from './utils/helpers.js'

test.describe('Проверка дашборда и навигации', () => {
  test.beforeEach(async ({ page }) => {
    await Helpers.login(page, 'admin', 'admin')
  })

  test('дашборд успешно загружается после авторизации', async ({ page }) => {

    await expect(page.getByRole('button', { name: 'Profile' })).toBeVisible()
    await expect(page.getByText('Welcome')).toBeVisible()

    await expect(page.getByRole('menuitem', { name: 'Users' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Task statuses' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Labels' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Tasks' })).toBeVisible()
  })
})