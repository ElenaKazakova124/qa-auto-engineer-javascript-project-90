import { test, expect } from '@playwright/test'

test('Приложение успешно рендерится', async ({ page }) => {
  await page.goto('/')
  
  await expect(page.locator('body')).not.toBeEmpty()
  
  const usernameInput = page.getByLabel('Username *')
  const passwordInput = page.getByLabel('Password *')
  const signInButton = page.getByRole('button', { name: 'SIGN IN' })
  
  const welcomeText = page.getByText('Welcome')
  const profileButton = page.getByRole('button', { name: 'Profile' })
  
  const isLoginPage = await usernameInput.isVisible().catch(() => false)
  const isDashboard = await welcomeText.isVisible().catch(() => false) || 
                     await profileButton.isVisible().catch(() => false)
  
  expect(isLoginPage || isDashboard).toBeTruthy()
})