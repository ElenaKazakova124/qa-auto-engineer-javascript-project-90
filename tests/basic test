import { test, expect } from '@playwright/test';

test('Приложение успешно рендерится', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('body')).not.toBeEmpty();
  await expect(page).toHaveTitle(/Task Manager|React Admin/);

  const loginForm = page.locator('input[name="username"]');
  if (await loginForm.isVisible()) {
    await expect(loginForm).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="sign in"]')).toBeVisible();
  }
});