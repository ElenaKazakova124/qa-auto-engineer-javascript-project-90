import { test, expect } from '@playwright/test';
import constants from './utils/constants.js';

test('Приложение успешно рендерится', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await expect(page.locator('body')).not.toBeEmpty();
  
  const usernameInput = page.getByLabel(constants.authElements.usernameLabel);
  const passwordInput = page.getByLabel(constants.authElements.passwordLabel);
  const signInButton = page.getByRole('button', { name: constants.authElements.signInButton });
  
  const welcomeText = page.getByText(constants.mainPageElements.welcomeText);
  const profileButton = page.locator(`button:has-text("${constants.mainPageElements.profileButtonLabel}")`);
  
  const isLoginPage = await usernameInput.isVisible().catch(() => false);
  const isDashboard = await welcomeText.isVisible().catch(() => false) || 
                     await profileButton.isVisible().catch(() => false);
  
  expect(isLoginPage || isDashboard).toBeTruthy();
});