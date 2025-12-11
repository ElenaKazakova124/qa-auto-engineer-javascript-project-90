import { test, expect } from '@playwright/test';

test('приложение успешно рендерится', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).toBeVisible();

  const bodyText = await page.textContent('body');
  expect(bodyText).toBeTruthy();
  expect(bodyText.length).toBeGreaterThan(0);
});