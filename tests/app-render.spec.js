import { test, expect } from '@playwright/test';

test('Приложение успешно рендерится', async ({ page }) => {
  await page.goto('/');
  
  await expect(page.locator('body')).not.toBeEmpty();
  
  const usernameField = page.locator('input[name="username"], [data-testid="username"]');
  const profileButton = page.getByRole('button', { name: 'Profile' });
  
  const isLoginPage = await usernameField.isVisible();
  const isDashboard = await profileButton.isVisible();
  
  expect(isLoginPage || isDashboard).toBeTruthy();
});