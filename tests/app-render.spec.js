import { test, expect } from '@playwright/test'

test('Приложение успешно рендерится', async ({ page }) => {
  await page.goto('/')
  
  await expect(page.locator('body')).not.toBeEmpty()
  
  const usernameInput = page.locator('input[name="username"]')
  const profileButton = page.getByRole('button', { name: 'Profile' })
  
  const isLoginPage = await usernameInput.isVisible().catch(() => false)
  const isDashboard = await profileButton.isVisible().catch(() => false)
  
  expect(isLoginPage || isDashboard).toBeTruthy()
})