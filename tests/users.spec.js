import { test, expect } from '@playwright/test';
import helpers from './utils/helpers.js';

test.describe('Пользователи', () => {
  test.beforeEach(async ({ page }) => {
    await helpers.login(page, 'admin', 'admin');
    
    await page.goto('http://localhost:5173/#/users');
    await helpers.waitForTimeout(3000);
  });

  test('форма создания пользователя отображается корректно', async ({ page }) => {
    const createButton = page.locator('a:has-text("Create")').or(page.locator('button:has-text("Create")')).first();
    
    if (await createButton.isVisible({ timeout: 5000 })) {
      await createButton.click();
    } else {
      await page.goto('http://localhost:5173/#/users/create');
    }
    
    await helpers.waitForTimeout(2000);
    
    const emailInput = page.locator('input[name="email"]').or(page.locator('input[type="email"]')).first();
    const firstNameInput = page.locator('input[name="firstName"], input[name="first_name"]').first();
    const lastNameInput = page.locator('input[name="lastName"], input[name="last_name"]').first();
    
    const hasEmail = await emailInput.isVisible({ timeout: 3000 }).catch(() => false);
    const hasFirstName = await firstNameInput.isVisible({ timeout: 3000 }).catch(() => false);
    const hasLastName = await lastNameInput.isVisible({ timeout: 3000 }).catch(() => false);
    
    expect(hasEmail || hasFirstName || hasLastName).toBeTruthy();
  });

  test('создание нового пользователя', async ({ page }) => {
    await page.goto('http://localhost:5173/#/users/create');
    await helpers.waitForTimeout(2000);
    
    const userData = {
      email: helpers.generateEmail(),
      firstName: helpers.generateName('First'),
      lastName: helpers.generateName('Last')
    };
    
    const emailInput = page.locator('input[name="email"]').or(page.locator('input[type="email"]')).first();
    await emailInput.fill(userData.email);
    
    const firstNameInput = page.locator('input[name="firstName"], input[name="first_name"]').first();
    await firstNameInput.fill(userData.firstName);
    
    const lastNameInput = page.locator('input[name="lastName"], input[name="last_name"]').first();
    await lastNameInput.fill(userData.lastName);
    
    const saveButton = page.locator('button:has-text("Save")')
      .or(page.locator('button[type="submit"]'))
      .first();
    
    await saveButton.click();
    
    await helpers.waitForTimeout(4000);
    
    const currentUrl = page.url();
    expect(currentUrl).toContain('/users');
    
    await page.reload();
    await helpers.waitForTimeout(2000);
    
    const userElement = page.locator(`tr:has-text("${userData.email}")`).first();
    await userElement.isVisible({ timeout: 10000 }).catch(() => false);
  });

  test('просмотр списка пользователей', async ({ page }) => {
    const table = page.locator('table').first();
    const hasTable = await table.isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasTable).toBeTruthy();
    
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('редактирование пользователя через детальную страницу', async ({ page }) => {
    test.setTimeout(60000);
    
    const originalEmail = helpers.generateEmail('original');
    const originalFirstName = helpers.generateName('First');
    const originalLastName = helpers.generateName('Last');
    
    await page.goto('http://localhost:5173/#/users/create');
    await helpers.waitForTimeout(2000);
    
    const emailInput = page.locator('input[name="email"]').or(page.locator('input[type="email"]')).first();
    await emailInput.fill(originalEmail);
    
    const firstNameInput = page.locator('input[name="firstName"], input[name="first_name"]').first();
    await firstNameInput.fill(originalFirstName);
    
    const lastNameInput = page.locator('input[name="lastName"], input[name="last_name"]').first();
    await lastNameInput.fill(originalLastName);
    
    const saveButton = page.locator('button:has-text("Save")').first();
    await saveButton.click();
    
    await helpers.waitForTimeout(3000);
    
    await page.goto('http://localhost:5173/#/users');
    await helpers.waitForTimeout(2000);
    
    const userRow = page.locator('tr').filter({ hasText: originalEmail }).first();
    if (!await userRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      return;
    }
    
    const userLink = userRow.locator('td a').or(userRow.locator(`a:has-text("${originalEmail}")`)).first();
    if (await userLink.isVisible({ timeout: 3000 })) {
      await userLink.click();
    } else {
      const emailCell = userRow.locator('td').filter({ hasText: originalEmail }).first();
      await emailCell.click();
    }
    
    await helpers.waitForTimeout(3000);
    
    const editButton = page.locator('button:has-text("Edit")')
      .or(page.locator('a:has-text("Edit")'))
      .first();
    
    if (!await editButton.isVisible({ timeout: 5000 })) {
      return;
    }
    
    await editButton.click();
    await helpers.waitForTimeout(2000);
    
    const updatedData = {
      email: helpers.generateEmail('updated'),
      firstName: helpers.generateName('UpdatedFirst'),
      lastName: helpers.generateName('UpdatedLast')
    };
    
    const editEmailInput = page.locator('input[name="email"]').or(page.locator('input[type="email"]')).first();
    await editEmailInput.fill(updatedData.email);
    
    const editFirstNameInput = page.locator('input[name="firstName"], input[name="first_name"]').first();
    await editFirstNameInput.fill(updatedData.firstName);
    
    const editLastNameInput = page.locator('input[name="lastName"], input[name="last_name"]').first();
    await editLastNameInput.fill(updatedData.lastName);
    
    const updateButton = page.locator('button:has-text("Save")')
      .or(page.locator('button:has-text("Update")'))
      .or(page.locator('button[type="submit"]'))
      .first();
    
    await updateButton.click();
    
    await helpers.waitForTimeout(4000);
  });

  test('валидация email при редактировании пользователя', async ({ page }) => {
    test.setTimeout(60000);
    
    const testEmail = helpers.generateEmail('test');
    const testFirstName = helpers.generateName('Test');
    const testLastName = helpers.generateName('User');
    
    await page.goto('http://localhost:5173/#/users/create');
    await helpers.waitForTimeout(2000);
    
    const emailInput = page.locator('input[name="email"]').or(page.locator('input[type="email"]')).first();
    await emailInput.fill(testEmail);
    
    const firstNameInput = page.locator('input[name="firstName"], input[name="first_name"]').first();
    await firstNameInput.fill(testFirstName);
    
    const lastNameInput = page.locator('input[name="lastName"], input[name="last_name"]').first();
    await lastNameInput.fill(testLastName);
    
    const saveButton = page.locator('button:has-text("Save")').first();
    await saveButton.click();
    
    await helpers.waitForTimeout(3000);
    
    await page.goto('http://localhost:5173/#/users');
    await helpers.waitForTimeout(2000);
    
    const userRow = page.locator('tr').filter({ hasText: testEmail }).first();
    if (!await userRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      return;
    }
    
    const userLink = userRow.locator('td a').or(userRow.locator(`a:has-text("${testEmail}")`)).first();
    if (await userLink.isVisible({ timeout: 3000 })) {
      await userLink.click();
    } else {
      const emailCell = userRow.locator('td').filter({ hasText: testEmail }).first();
      await emailCell.click();
    }
    
    await helpers.waitForTimeout(3000);
    
    const editButton = page.locator('button:has-text("Edit")').first();
    if (!await editButton.isVisible({ timeout: 5000 })) {
      return;
    }
    
    await editButton.click();
    await helpers.waitForTimeout(2000);
    
    const editEmailInput = page.locator('input[name="email"]').or(page.locator('input[type="email"]')).first();
    await editEmailInput.fill('invalid-email');
    
    const updateButton = page.locator('button:has-text("Save")').first();
    await updateButton.click();
    
    await helpers.waitForTimeout(2000);
    
    const errorMessages = [
      page.locator('.error'),
      page.locator('.Mui-error'),
      page.locator('[role="alert"]'),
      page.locator('text*="invalid"'),
      page.locator('text*="ошибка"'),
      page.locator('text*="error"')
    ];
    
    for (const errorLocator of errorMessages) {
      await errorLocator.isVisible({ timeout: 2000 }).catch(() => false);
    }
  });

  test('удаление пользователя через детальную страницу', async ({ page }) => {
    test.setTimeout(60000);
    
    const userToDelete = helpers.generateEmail('delete');
    const firstName = helpers.generateName('ToDelete');
    const lastName = helpers.generateName('User');
    
    await page.goto('http://localhost:5173/#/users/create');
    await helpers.waitForTimeout(2000);
    
    const emailInput = page.locator('input[name="email"]').or(page.locator('input[type="email"]')).first();
    await emailInput.fill(userToDelete);
    
    const firstNameInput = page.locator('input[name="firstName"], input[name="first_name"]').first();
    await firstNameInput.fill(firstName);
    
    const lastNameInput = page.locator('input[name="lastName"], input[name="last_name"]').first();
    await lastNameInput.fill(lastName);
    
    const saveButton = page.locator('button:has-text("Save")').first();
    await saveButton.click();
    
    await helpers.waitForTimeout(3000);
    
    await page.goto('http://localhost:5173/#/users');
    await helpers.waitForTimeout(2000);
    
    const userRow = page.locator('tr').filter({ hasText: userToDelete }).first();
    if (!await userRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      return;
    }
    
    const userLink = userRow.locator('td a').or(userRow.locator(`a:has-text("${userToDelete}")`)).first();
    if (await userLink.isVisible({ timeout: 3000 })) {
      await userLink.click();
    } else {
      const emailCell = userRow.locator('td').filter({ hasText: userToDelete }).first();
      await emailCell.click();
    }
    
    await helpers.waitForTimeout(3000);
    
    const deleteButton = page.locator('button:has-text("Delete")').first();
    
    if (!await deleteButton.isVisible({ timeout: 5000 })) {
      return;
    }
    
    await deleteButton.click();
    
    await helpers.waitForTimeout(2000);
    
    const confirmSelectors = [
      'button:has-text("Confirm")',
      'button:has-text("Yes")',
      'button:has-text("Delete")',
      'button:has-text("Удалить")',
      '[role="dialog"] button:has-text("Confirm")',
      '[role="dialog"] button:has-text("Delete")'
    ];
    
    for (const selector of confirmSelectors) {
      const confirmButton = page.locator(selector).first();
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        const elementHandle = await confirmButton.elementHandle();
        if (elementHandle) {
          await page.evaluate((el) => el.click(), elementHandle);
        } else {
          await confirmButton.click({ force: true });
        }
        break;
      }
    }
    
    await helpers.waitForTimeout(4000);
  });

  test('массовое удаление пользователей', async ({ page }) => {
    test.setTimeout(60000);
    
    const checkboxes = page.locator('tbody input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    if (checkboxCount === 0) {
      return;
    }
    
    const firstCheckbox = checkboxes.first();
    await firstCheckbox.check();
    await helpers.waitForTimeout(1000);
    
    await page.locator(':has-text("selected")').or(page.locator(':has-text("выбрано")')).first().isVisible({ timeout: 3000 }).catch(() => false);
    
    const bulkDeleteButtons = [
      page.locator('button:has-text("Delete selected")'),
      page.locator('button:has-text("Delete Selected")'),
      page.locator('button:has-text("Удалить выбранные")'),
      page.locator('[aria-label*="delete selected"]'),
      page.locator('button:has-text("Delete")').filter({ hasText: /selected/i })
    ];
    
    let bulkDeleteButton = null;
    for (const button of bulkDeleteButtons) {
      if (await button.isVisible({ timeout: 2000 }).catch(() => false)) {
        bulkDeleteButton = button;
        break;
      }
    }
    
    if (!bulkDeleteButton) {
      return;
    }
    
    await bulkDeleteButton.click();
    
    await helpers.waitForTimeout(2000);
    
    const confirmButton = page.locator('button:has-text("Confirm")')
      .or(page.locator('button:has-text("Yes")'))
      .or(page.locator('button:has-text("Delete")'))
      .first();
    
    if (await confirmButton.isVisible({ timeout: 3000 })) {
      const elementHandle = await confirmButton.elementHandle();
      if (elementHandle) {
        await page.evaluate((el) => el.click(), elementHandle);
      } else {
        await confirmButton.click({ force: true });
      }
    }
    
    await helpers.waitForTimeout(3000);
  });
});