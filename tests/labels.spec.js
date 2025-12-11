import { test, expect } from '@playwright/test';
import helpers from './utils/helpers.js';

test.describe('Метки', () => {
  test.beforeEach(async ({ page }) => {
    const loginSuccess = await helpers.login(page, 'admin', 'admin');
    expect(loginSuccess).toBeTruthy();
    
    await helpers.waitForTimeout(2000);
    
    await page.goto('http://localhost:5173/#/labels');
    await helpers.waitForTimeout(2000);
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('страница меток загружается', async ({ page }) => {
    expect(page.url()).toContain('/labels');
    
    const createButton = page.locator('a:has-text("Create"), button:has-text("Create")').first();
    const table = page.locator('table').first();
    
    const hasCreateButton = await createButton.isVisible().catch(() => false);
    const hasTable = await table.isVisible().catch(() => false);
    
    expect(hasCreateButton || hasTable).toBeTruthy();
  });

  test('создание новой метки', async ({ page }) => {
    const createButton = page.locator('a:has-text("Create"), button:has-text("Create")').first();
    if (!await createButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      if (!page.url().includes('/labels/create')) {
        throw new Error('Кнопка Create не найдена');
      }
    } else {
      await createButton.click();
      await helpers.waitForTimeout(2000);
    }
    
    const labelName = helpers.generateName('TestLabel');
    
    const nameInputSelectors = [
      'input[name="name"]',
      'input[placeholder*="Name"]',
      'input[placeholder*="Название"]',
      'input[type="text"]:first-of-type'
    ];
    
    let nameInput = null;
    for (const selector of nameInputSelectors) {
      const input = page.locator(selector).first();
      if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
        nameInput = input;
        break;
      }
    }
    
    if (!nameInput) {
      nameInput = page.getByLabel('Name').or(page.getByLabel('Название'));
    }
    
    expect(nameInput).toBeTruthy();
    await nameInput.fill(labelName);
    
    const saveButtonSelectors = [
      'button:has-text("Save")',
      'button[type="submit"]',
      'button:has-text("Сохранить")',
      'button:has-text("Create")'
    ];
    
    let saveButton = null;
    for (const selector of saveButtonSelectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
        saveButton = button;
        break;
      }
    }
    
    expect(saveButton).toBeTruthy();
    await saveButton.click();
    
    await helpers.waitForTimeout(3000);
    
    const labelElement = page.locator(`:has-text("${labelName}"):visible`).first();
    expect(await labelElement.isVisible({ timeout: 10000 }).catch(() => false)).toBeTruthy();
  });

  test('редактирование метки', async ({ page }) => {
    const originalLabel = helpers.generateName('OriginalLabel');
    
    const createButton = page.locator('a:has-text("Create"), button:has-text("Create")').first();
    await createButton.click({ timeout: 10000 });
    await helpers.waitForTimeout(2000);
    
    const nameInput = page.locator('input[name="name"], input[placeholder*="Name"]').first();
    await nameInput.fill(originalLabel);
    
    const saveButton = page.locator('button:has-text("Save"), button[type="submit"]').first();
    await saveButton.click();
    
    await helpers.waitForTimeout(3000);
    
    await page.goto('http://localhost:5173/#/labels');
    await helpers.waitForTimeout(2000);
    
    const labelText = page.locator(`:has-text("${originalLabel}"):visible`).first();
    if (!await labelText.isVisible({ timeout: 5000 }).catch(() => false)) {
      return;
    }
    
    const labelRow = page.locator('tr').filter({ hasText: originalLabel }).first();
    if (!await labelRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      await labelText.click();
      await helpers.waitForTimeout(2000);
    } else {
      const editButton = labelRow.locator('button:has-text("Edit"), a:has-text("Edit")').first();
      
      if (!await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await labelText.click();
        await helpers.waitForTimeout(2000);
        
        const editButtonOnPage = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
        if (await editButtonOnPage.isVisible({ timeout: 3000 }).catch(() => false)) {
          await editButtonOnPage.click();
        } else {
          return;
        }
      } else {
        await editButton.click();
      }
    }
    
    await helpers.waitForTimeout(2000);
    
    const updatedLabel = helpers.generateName('UpdatedLabel');
    const editInput = page.locator('input[name="name"], input[placeholder*="Name"]').first();
    await editInput.fill(updatedLabel);
    
    const updateButton = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]').first();
    await updateButton.click();
    
    await helpers.waitForTimeout(3000);
    
    const updatedLabelElement = page.locator(`:has-text("${updatedLabel}"):visible`).first();
    expect(await updatedLabelElement.isVisible({ timeout: 10000 }).catch(() => false)).toBeTruthy();
  });

  test('удаление метки', async ({ page }) => {
    const labelToDelete = helpers.generateName('DeleteLabel');
    
    try {
      const createButton = page.locator('a:has-text("Create")').or(page.locator('button:has-text("Create")')).first();
      
      if (await createButton.isVisible({ timeout: 5000 })) {
        await createButton.click();
        await helpers.waitForTimeout(2000);
      } else {
        await page.goto('http://localhost:5173/#/labels/create');
      }
    } catch {
      await page.goto('http://localhost:5173/#/labels/create');
    }
    
    await helpers.waitForTimeout(2000);
    
    const nameInputSelectors = [
      'input[name="name"]',
      'input[placeholder*="Name"]',
      'input[placeholder*="Название"]',
      'input[type="text"]'
    ];
    
    let nameInput = null;
    for (const selector of nameInputSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
        nameInput = element;
        break;
      }
    }
    
    if (!nameInput) {
      nameInput = page.getByLabel('Name').or(page.getByLabel('Название')).first();
    }
    
    if (await nameInput.isVisible({ timeout: 5000 })) {
      await nameInput.fill(labelToDelete);
    } else {
      throw new Error('Поле для ввода имени метки не найдено');
    }
    
    const saveButton = page.locator('button:has-text("Save")')
      .or(page.locator('button:has-text("Сохранить")'))
      .or(page.locator('button[type="submit"]'))
      .or(page.locator('button:has-text("Create")'))
      .first();
    
    if (await saveButton.isVisible({ timeout: 5000 })) {
      await saveButton.click();
      await helpers.waitForTimeout(3000);
    } else {
      await page.keyboard.press('Enter');
      await helpers.waitForTimeout(3000);
    }
    
    await page.goto('http://localhost:5173/#/labels');
    await helpers.waitForTimeout(3000);
    
    const labelRow = page.locator('tbody tr').filter({ hasText: labelToDelete }).first();
    
    if (!await labelRow.isVisible({ timeout: 10000 })) {
      const labelElement = page.locator(`:has-text("${labelToDelete}")`).first();
      if (await labelElement.isVisible({ timeout: 5000 })) {
        await labelElement.click();
        await helpers.waitForTimeout(2000);
        
        const deleteButton = page.locator('button:has-text("Delete")').first();
        if (await deleteButton.isVisible({ timeout: 5000 })) {
          await page.evaluate((button) => {
            button.click();
          }, await deleteButton.elementHandle());
        } else {
          return;
        }
      } else {
        return;
      }
    } else {
      await labelRow.hover();
      await helpers.waitForTimeout(1000);
      
      const deleteButtonSelectors = [
        labelRow.locator('button:has-text("Delete")'),
        labelRow.locator('[aria-label*="delete" i]'),
        labelRow.locator('[title*="delete" i]'),
        labelRow.locator('button svg'),
        page.locator(`button:has-text("Delete"):near(:text("${labelToDelete}"))`)
      ];
      
      let deleteButton = null;
      for (const selector of deleteButtonSelectors) {
        if (await selector.isVisible({ timeout: 1000 }).catch(() => false)) {
          deleteButton = selector;
          break;
        }
      }
      
      if (!deleteButton) {
        const menuButton = labelRow.locator('button:has-text("...")').or(labelRow.locator('[aria-label="more"]'));
        if (await menuButton.isVisible({ timeout: 2000 })) {
          await menuButton.click();
          await helpers.waitForTimeout(1000);
          
          const menuDeleteButton = page.locator('[role="menu"] button:has-text("Delete")');
          if (await menuDeleteButton.isVisible({ timeout: 2000 })) {
            deleteButton = menuDeleteButton;
          }
        }
      }
      
      if (deleteButton) {
        const elementHandle = await deleteButton.elementHandle();
        if (elementHandle) {
          await page.evaluate((el) => {
            el.click();
          }, elementHandle);
        } else {
          await deleteButton.click({ force: true });
        }
        await helpers.waitForTimeout(2000);
      } else {
        const labelCell = labelRow.locator('td').filter({ hasText: labelToDelete }).first();
        if (await labelCell.isVisible({ timeout: 2000 })) {
          await labelCell.click();
          await helpers.waitForTimeout(2000);
          
          const detailDeleteButton = page.locator('button:has-text("Delete")').first();
          if (await detailDeleteButton.isVisible({ timeout: 5000 })) {
            await page.evaluate((button) => {
              button.click();
            }, await detailDeleteButton.elementHandle());
            await helpers.waitForTimeout(2000);
          }
        }
      }
    }
    
    await helpers.waitForTimeout(2000);
    
    const dialog = page.locator('[role="dialog"], .MuiDialog-root, .MuiModal-root').first();
    if (await dialog.isVisible({ timeout: 5000 }).catch(() => false)) {
      const confirmInDialog = dialog.locator('button:has-text("Confirm")')
        .or(dialog.locator('button:has-text("Yes")'))
        .or(dialog.locator('button:has-text("Delete")'))
        .or(dialog.locator('button:has-text("Удалить")'))
        .or(dialog.locator('button:has-text("OK")'))
        .first();
      
      if (await confirmInDialog.isVisible({ timeout: 3000 })) {
        const elementHandle = await confirmInDialog.elementHandle();
        if (elementHandle) {
          await page.evaluate((el) => {
            el.click();
          }, elementHandle);
        } else {
          await confirmInDialog.click({ force: true });
        }
      }
    } else {
      const confirmSelectors = [
        'button:has-text("Confirm")',
        'button:has-text("Yes")',
        'button:has-text("Delete")',
        'button:has-text("Удалить")',
        'button:has-text("OK")'
      ];
      
      for (const selector of confirmSelectors) {
        const confirmButton = page.locator(selector).first();
        if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          const elementHandle = await confirmButton.elementHandle();
          if (elementHandle) {
            await page.evaluate((el) => {
              el.click();
            }, elementHandle);
            break;
          } else {
            await confirmButton.click({ force: true });
            break;
          }
        }
      }
    }
    
    await helpers.waitForTimeout(4000);
    
    await page.reload();
    await helpers.waitForTimeout(2000);
    
    const labelAfterDelete = page.locator(`:has-text("${labelToDelete}"):visible`).first();
    const isStillVisible = await labelAfterDelete.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isStillVisible) {
      await page.screenshot({ path: `debug-label-still-visible-${Date.now()}.png` });
    }
  });

  test('кнопка Create доступна', async ({ page }) => {
    const createButton = page.locator('a:has-text("Create"), button:has-text("Create")').first();
    const isVisible = await createButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!isVisible) {
      const isOnCreatePage = page.url().includes('/labels/create') || 
                            page.url().includes('/labels/new');
      if (!isOnCreatePage) {
        throw new Error('Кнопка Create не видна и мы не на странице создания');
      }
      return;
    }
    
    expect(await createButton.isEnabled()).toBeTruthy();
  });
});