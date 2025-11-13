import { test, expect } from '@playwright/test'
import Helpers from './utils/helpers.js'

test('авторизация и выход', async ({ page }) => {
  await Helpers.login(page, 'admin', 'admin')
  
  const profileButton = page.getByRole('button', { name: 'Profile' })
  await expect(profileButton).toBeVisible()
  
  await Helpers.logout(page)
  
  const signInButton = page.getByRole('button', { name: 'SIGN IN' })
  await expect(signInButton).toBeVisible()
})