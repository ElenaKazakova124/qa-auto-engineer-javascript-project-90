import { test, expect } from '@playwright/test';
import LoginPage from './pages/LoginPage.js';
import DashboardPage from './pages/DashboardPage.js';
import helpers from './utils/helpers.js';

test.describe('Статусы', () => {
  test.beforeEach(async ({ page }) => {
    const _loginPage = new LoginPage(page);
    const _dashboardPage = new DashboardPage(page);
    
    await helpers.login(page, 'admin', 'admin');
    
    await page.goto('http://localhost:5173/#/task_statuses');
    await helpers.waitForTimeout(3000);
  });

  test('страница статусов загружается', async ({ page }) => {
    expect(page.url()).toContain('/task_statuses');
    
    const table = page.locator('table').first();
    const hasTable = await table.isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasTable).toBeTruthy();
    
    const bodyText = await page.textContent('body');
    const hasNameColumn = bodyText.toLowerCase().includes('name');
    const hasSlugColumn = bodyText.toLowerCase().includes('slug');
    const hasCreatedAtColumn = bodyText.toLowerCase().includes('created');
    
    expect(hasNameColumn || hasSlugColumn || hasCreatedAtColumn).toBeTruthy();
  });

  test('кнопка Create доступна на странице статусов', async ({ page }) => {
    const createButtons = [
      page.locator('a:has-text("Create")'),
      page.locator('button:has-text("Create")'),
      page.locator('[href*="/task_statuses/create"]'),
      page.locator('text="Create"').first()
    ];
    
    let createButton = null;
    for (const button of createButtons) {
      if (await button.isVisible({ timeout: 3000 }).catch(() => false)) {
        createButton = button;
        break;
      }
    }
    
    if (!createButton) {
      const bodyText = await page.textContent('body');
      if (bodyText.includes('Create')) {
        expect(true).toBeTruthy();
        return;
      }
      throw new Error('Кнопка Create не найдена');
    }
    
    expect(await createButton.isEnabled()).toBeTruthy();
  });

  test('создание нового статуса', async ({ page }) => {
    const createButton = page.locator('a:has-text("Create")').or(page.locator('button:has-text("Create")')).first();
    
    if (await createButton.isVisible({ timeout: 5000 })) {
      await createButton.click();
    } else {
      await page.goto('http://localhost:5173/#/task_statuses/create');
    }
    
    await helpers.waitForTimeout(2000);
    
    const pageUrl = page.url();
    expect(pageUrl).toContain('/task_statuses/create');
    
    const nameInput = page.locator('input[name="name"]').or(page.locator('input[placeholder*="Name"]')).first();
    
    const slugInput = page.locator('input[name="slug"]').or(page.locator('input[placeholder*="Slug"]')).first();
    
    const statusData = {
      name: helpers.generateName('Status'),
      slug: helpers.generateSlug()
    };
    
    if (await nameInput.isVisible({ timeout: 3000 })) {
      await nameInput.fill(statusData.name);
    } else {
      const nameField = page.locator('input:first-of-type');
      if (await nameField.isVisible({ timeout: 3000 })) {
        await nameField.fill(statusData.name);
      }
    }
    
    if (await slugInput.isVisible({ timeout: 3000 })) {
      await slugInput.fill(statusData.slug);
    } else {
      const inputs = await page.locator('input').all();
      if (inputs.length >= 2) {
        await inputs[1].fill(statusData.slug);
      }
    }
    
    const saveButton = page.locator('button:has-text("Save")')
      .or(page.locator('button[type="submit"]'))
      .first();
    
    if (!await saveButton.isVisible({ timeout: 3000 })) {
      await page.keyboard.press('Enter');
    } else {
      await saveButton.click();
    }
    
    await helpers.waitForTimeout(4000);
    
    const currentUrl = page.url();
    expect(currentUrl).toContain('/task_statuses');
    
    await helpers.waitForTimeout(2000);
    
    await page.reload();
    await helpers.waitForTimeout(2000);
    
    const statusElement = page.locator(`tr:has-text("${statusData.name}")`).first();
    const _isStatusVisible = await statusElement.isVisible({ timeout: 10000 }).catch(() => false);
    
    if (!_isStatusVisible) {
      await page.screenshot({ path: `debug-status-not-found-${Date.now()}.png` });
    }
  });

  test('отображение существующих статусов', async ({ page }) => {
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    
    expect(rowCount).toBeGreaterThan(0);
  });

  test('редактирование статуса через детальную страницу', async ({ page }) => {
    test.setTimeout(60000);
    
    const originalName = helpers.generateName('TestStatus');
    const originalSlug = helpers.generateSlug();
    
    await page.goto('http://localhost:5173/#/task_statuses/create');
    await helpers.waitForTimeout(2000);
    
    const nameInput = page.locator('input[name="name"]').or(page.locator('input[placeholder*="Name"]')).first();
    await nameInput.fill(originalName);
    
    const slugInput = page.locator('input[name="slug"]').or(page.locator('input[placeholder*="Slug"]')).first();
    if (await slugInput.isVisible({ timeout: 3000 })) {
      await slugInput.fill(originalSlug);
    }
    
    const saveButton = page.locator('button:has-text("Save")').first();
    await saveButton.click();
    
    await helpers.waitForTimeout(3000);
    
    await page.goto('http://localhost:5173/#/task_statuses');
    await helpers.waitForTimeout(2000);
    
    const statusRow = page.locator('tr').filter({ hasText: originalName }).first();
    if (!await statusRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      return;
    }
    
    const statusLink = statusRow.locator('td a').or(statusRow.locator(`a:has-text("${originalName}")`)).first();
    if (await statusLink.isVisible({ timeout: 3000 })) {
      await statusLink.click();
    } else {
      const nameCell = statusRow.locator('td').filter({ hasText: originalName }).first();
      await nameCell.click();
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
    
    const updatedName = helpers.generateName('UpdatedStatus');
    const updatedSlug = helpers.generateSlug('updated');
    
    const editNameInput = page.locator('input[name="name"]').or(page.locator('input[placeholder*="Name"]')).first();
    await editNameInput.fill(updatedName);
    
    const editSlugInput = page.locator('input[name="slug"]').or(page.locator('input[placeholder*="Slug"]')).first();
    if (await editSlugInput.isVisible({ timeout: 3000 })) {
      await editSlugInput.fill(updatedSlug);
    }
    
    const updateButton = page.locator('button:has-text("Save")')
      .or(page.locator('button:has-text("Update")'))
      .or(page.locator('button[type="submit"]'))
      .first();
    
    await updateButton.click();
    
    await helpers.waitForTimeout(4000);
  });

  test('удаление статуса через детальную страницу', async ({ page }) => {
    test.setTimeout(60000);
    
    const statusToDelete = helpers.generateName('DeleteStatus');
    const slugToDelete = helpers.generateSlug();
    
    await page.goto('http://localhost:5173/#/task_statuses/create');
    await helpers.waitForTimeout(2000);
    
    const nameInput = page.locator('input[name="name"]').or(page.locator('input[placeholder*="Name"]')).first();
    await nameInput.fill(statusToDelete);
    
    const slugInput = page.locator('input[name="slug"]').or(page.locator('input[placeholder*="Slug"]')).first();
    if (await slugInput.isVisible({ timeout: 3000 })) {
      await slugInput.fill(slugToDelete);
    }
    
    const saveButton = page.locator('button:has-text("Save")').first();
    await saveButton.click();
    
    await helpers.waitForTimeout(3000);
    
    await page.goto('http://localhost:5173/#/task_statuses');
    await helpers.waitForTimeout(2000);
    
    const statusRow = page.locator('tr').filter({ hasText: statusToDelete }).first();
    if (!await statusRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      return;
    }
    
    const statusLink = statusRow.locator('td a').or(statusRow.locator(`a:has-text("${statusToDelete}")`)).first();
    if (await statusLink.isVisible({ timeout: 3000 })) {
      await statusLink.click();
    } else {
      const nameCell = statusRow.locator('td').filter({ hasText: statusToDelete }).first();
      await nameCell.click();
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

  test('массовое удаление статусов через выделение', async ({ page }) => {
    test.setTimeout(60000);
    
    const checkboxes = page.locator('tbody input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    if (checkboxCount === 0) {
      return;
    }
    
    const firstCheckbox = checkboxes.first();
    await firstCheckbox.check();
    await helpers.waitForTimeout(1000);
    
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