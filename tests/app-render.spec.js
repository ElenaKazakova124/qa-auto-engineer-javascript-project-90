import { test, expect } from '@playwright/test'

test('Приложение успешно рендерится', async ({ page }) => {
  await page.goto('/')
  
  await expect(page.locator('body')).not.toBeEmpty()
  
  const usernameInput = page.getByLabel('Username*')
  const welcomeText = page.getByText('Welcome to the administration')
  
  const isLoginPage = await usernameInput.isVisible().catch(() => false)
  const isDashboard = await welcomeText.isVisible().catch(() => false)
  
  expect(isLoginPage || isDashboard).toBeTruthy()
})