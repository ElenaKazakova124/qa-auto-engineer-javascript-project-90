import { test, expect } from '@playwright/test';

test('приложение загружается', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  const loginForm = page.locator('input[type="email"], input[type="password"], [data-testid="login-form"]');
  const dashboard = page.locator('[data-testid="dashboard"], .dashboard, nav, header');
  const profileButton = page.locator('[data-testid="profile"], .profile, button:has-text("Profile")');
  
  await Promise.race([
    loginForm.waitFor({ state: 'visible', timeout: 10000 }),
    dashboard.waitFor({ state: 'visible', timeout: 10000 }),
    profileButton.waitFor({ state: 'visible', timeout: 10000 })
  ]);
  
  const isLoginPage = await loginForm.isVisible().catch(() => false);
  const isDashboard = await dashboard.isVisible().catch(() => false);
  const isProfile = await profileButton.isVisible().catch(() => false);
  
  expect(isLoginPage || isDashboard || isProfile).toBeTruthy();
});