import { test, expect } from '@playwright/test'
import Helpers from './utils/helpers.js'

test('авторизация и выход', async ({ page }) => {

  await Helpers.login(page, 'admin', 'admin')
  await expect(page.getByText('Welcome')).toBeVisible()
  await Helpers.logout(page)
  
  const signInButton = page.getByRole('button', { name: 'SIGN IN' })
  await expect(signInButton).toBeVisible()
})