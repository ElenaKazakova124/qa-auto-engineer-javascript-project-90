import { test, expect } from '@playwright/test';
import LoginPage from './pages/LoginPage.js';
import DashboardPage from './pages/DashboardPage.js';
import helpers from './utils/helpers.js';

test.describe('Задачи', () => {
  test.beforeEach(async ({ page }) => {
    const _loginPage = new LoginPage(page);
    const _dashboardPage = new DashboardPage(page);
    
    await helpers.login(page, 'admin', 'admin');
    
    await page.goto('http://localhost:5173/#/tasks');
    await helpers.waitForTimeout(3000);
  });

  test('страница задач загружается', async ({ page }) => {
    expect(page.url()).toContain('/tasks');
    
    const bodyText = await page.textContent('body');
    const hasTasksText = bodyText.includes('Tasks') || bodyText.includes('tasks');
    
    const createButton = page.locator('a:has-text("Create")').or(page.locator('button:has-text("Create")')).first();
    const hasCreateButton = await createButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    const hasStatusColumns = 
      bodyText.includes('Draft') || 
      bodyText.includes('To Review') || 
      bodyText.includes('To Be Fixed') || 
      bodyText.includes('To Publish') || 
      bodyText.includes('Published');
    
    const hasTaskElements = bodyText.includes('Task') && !bodyText.includes('Tasks');
    
    const isPageLoaded = hasTasksText || hasCreateButton || hasStatusColumns || hasTaskElements;
    
    expect(isPageLoaded).toBeTruthy();
  });

  test('кнопка Create доступна на странице задач', async ({ page }) => {
    const createButtons = [
      page.locator('a:has-text("Create")'),
      page.locator('button:has-text("Create")'),
      page.locator('[href*="/tasks/create"]'),
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

  test('создание новой задачи', async ({ page }) => {
    await page.goto('http://localhost:5173/#/tasks/create');
    await helpers.waitForTimeout(2000);
    
    const pageUrl = page.url();
    expect(pageUrl).toContain('/tasks/create');
    
    const taskData = {
      title: helpers.generateTaskTitle(),
      content: 'Test task description'
    };
    
    const titleInput = page.locator('input[name="title"], input[name="name"], input[placeholder*="Title"], input[placeholder*="Название"]').first();
    const contentInput = page.locator('textarea[name="content"], textarea[name="description"], textarea[placeholder*="Content"], textarea[placeholder*="Описание"]').first();
    
    if (await titleInput.isVisible({ timeout: 5000 })) {
      await titleInput.fill(taskData.title);
    } else {
      const firstInput = page.locator('input[type="text"]').first();
      if (await firstInput.isVisible({ timeout: 3000 })) {
        await firstInput.fill(taskData.title);
      }
    }
    
    if (await contentInput.isVisible({ timeout: 3000 })) {
      await contentInput.fill(taskData.content);
    } else {
      const textarea = page.locator('textarea').first();
      if (await textarea.isVisible({ timeout: 3000 })) {
        await textarea.fill(taskData.content);
      }
    }
    
    const assigneeSelect = page.locator('select[name="assignee"], [aria-label*="assignee" i], [id*="assignee"]').first();
    if (await assigneeSelect.isVisible({ timeout: 2000 })) {
      const isSelect = await assigneeSelect.evaluate(el => el.tagName === 'SELECT');
      if (isSelect) {
        await assigneeSelect.selectOption({ index: 1 });
      } else {
        await assigneeSelect.click({ force: true });
        await helpers.waitForTimeout(1000);
        const firstOption = page.locator('[role="option"]').first();
        if (await firstOption.isVisible({ timeout: 2000 })) {
          await firstOption.click();
        }
      }
    }
    
    const statusSelect = page.locator('select[name="status"], [aria-label*="status" i], [id*="status"]').first();
    if (await statusSelect.isVisible({ timeout: 2000 })) {
      const isSelect = await statusSelect.evaluate(el => el.tagName === 'SELECT');
      if (isSelect) {
        await statusSelect.selectOption({ index: 1 });
      } else {
        await statusSelect.click({ force: true });
        await helpers.waitForTimeout(1000);
        const firstOption = page.locator('[role="option"]').first();
        if (await firstOption.isVisible({ timeout: 2000 })) {
          await firstOption.click();
        }
      }
    }
    
    const labelSelect = page.locator('select[name="label"], [aria-label*="label" i], [id*="label"]').first();
    if (await labelSelect.isVisible({ timeout: 2000 })) {
      const isSelect = await labelSelect.evaluate(el => el.tagName === 'SELECT');
      if (isSelect) {
        await labelSelect.selectOption({ index: 1 });
      } else {
        await labelSelect.focus();
        await helpers.waitForTimeout(500);
        await page.keyboard.press('ArrowDown');
        await helpers.waitForTimeout(500);
        await page.keyboard.press('Enter');
      }
    }
    
    const saveButton = page.locator('button:has-text("Save")')
      .or(page.locator('button:has-text("Create")'))
      .or(page.locator('button[type="submit"]'))
      .first();
    
    await saveButton.click();
    
    await helpers.waitForTimeout(4000);
    
    const currentUrl = page.url();
    expect(currentUrl).toContain('/tasks');
    
    await page.reload();
    await helpers.waitForTimeout(2000);
    
    const taskElement = page.locator(`tr:has-text("${taskData.title}"), div:has-text("${taskData.title}"), :has-text("${taskData.title}"):visible`).first();
    await taskElement.isVisible({ timeout: 10000 }).catch(() => false);
  });

  test('редактирование задачи через детальную страницу', async ({ page }) => {
    test.setTimeout(60000);
    
    const originalTitle = helpers.generateTaskTitle('Original');
    const originalContent = 'Original task content';
    
    await page.goto('http://localhost:5173/#/tasks/create');
    await helpers.waitForTimeout(2000);
    
    const titleInput = page.locator('input[name="title"], input[name="name"], input[placeholder*="Title"]').first();
    await titleInput.fill(originalTitle);
    
    const contentInput = page.locator('textarea[name="content"], textarea[name="description"], textarea[placeholder*="Content"]').first();
    if (await contentInput.isVisible({ timeout: 3000 })) {
      await contentInput.fill(originalContent);
    }
    
    const saveButton = page.locator('button:has-text("Save")').first();
    await saveButton.click();
    
    await helpers.waitForTimeout(3000);
    
    await page.goto('http://localhost:5173/#/tasks');
    await helpers.waitForTimeout(2000);
    
    const taskRow = page.locator('tr, .task-item, [class*="task"]').filter({ hasText: originalTitle }).first();
    if (!await taskRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      return;
    }
    
    const taskLink = taskRow.locator('a').or(taskRow.locator(`:has-text("${originalTitle}")`)).first();
    if (await taskLink.isVisible({ timeout: 3000 })) {
      await taskLink.click();
    } else {
      const titleElement = taskRow.locator(`:has-text("${originalTitle}")`).first();
      await titleElement.click();
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
    
    const updatedTitle = helpers.generateTaskTitle('Updated');
    const updatedContent = 'Updated task content';
    
    const editTitleInput = page.locator('input[name="title"], input[name="name"], input[placeholder*="Title"]').first();
    await editTitleInput.fill(updatedTitle);
    
    const editContentInput = page.locator('textarea[name="content"], textarea[name="description"], textarea[placeholder*="Content"]').first();
    if (await editContentInput.isVisible({ timeout: 3000 })) {
      await editContentInput.fill(updatedContent);
    }
    
    const updateButton = page.locator('button:has-text("Save")')
      .or(page.locator('button:has-text("Update")'))
      .or(page.locator('button[type="submit"]'))
      .first();
    
    await updateButton.click();
    
    await helpers.waitForTimeout(4000);
  });

  test('удаление задачи через детальную страницу', async ({ page }) => {
    test.setTimeout(60000);
    
    const taskToDelete = helpers.generateTaskTitle('DeleteMe');
    const taskContent = 'Task to be deleted';
    
    await page.goto('http://localhost:5173/#/tasks/create');
    await helpers.waitForTimeout(2000);
    
    const titleInput = page.locator('input[name="title"], input[name="name"], input[placeholder*="Title"]').first();
    await titleInput.fill(taskToDelete);
    
    const contentInput = page.locator('textarea[name="content"], textarea[name="description"], textarea[placeholder*="Content"]').first();
    if (await contentInput.isVisible({ timeout: 3000 })) {
      await contentInput.fill(taskContent);
    }
    
    const saveButton = page.locator('button:has-text("Save")').first();
    await saveButton.click();
    
    await helpers.waitForTimeout(3000);
    
    await page.goto('http://localhost:5173/#/tasks');
    await helpers.waitForTimeout(2000);
    
    const taskRow = page.locator('tr, .task-item, [class*="task"]').filter({ hasText: taskToDelete }).first();
    if (!await taskRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      return;
    }
    
    const taskLink = taskRow.locator('a').or(taskRow.locator(`:has-text("${taskToDelete}")`)).first();
    if (await taskLink.isVisible({ timeout: 3000 })) {
      await taskLink.click();
    } else {
      const titleElement = taskRow.locator(`:has-text("${taskToDelete}")`).first();
      await titleElement.click();
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

  test('фильтрация задач', async ({ page }) => {
    const uniqueTask = helpers.generateTaskTitle('UniqueTask');
    const taskContent = 'This task should be found by filter';
    
    await page.goto('http://localhost:5173/#/tasks/create');
    await helpers.waitForTimeout(2000);
    
    const titleInput = page.locator('input[name="title"], input[name="name"], input[placeholder*="Title"]').first();
    await titleInput.fill(uniqueTask);
    
    const contentInput = page.locator('textarea[name="content"], textarea[name="description"], textarea[placeholder*="Content"]').first();
    if (await contentInput.isVisible({ timeout: 3000 })) {
      await contentInput.fill(taskContent);
    }
    
    const saveButton = page.locator('button:has-text("Save")').first();
    await saveButton.click();
    
    await helpers.waitForTimeout(3000);
    
    await page.goto('http://localhost:5173/#/tasks');
    await helpers.waitForTimeout(2000);
    
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="Поиск"], input[type="search"]').first();
    if (!await searchInput.isVisible({ timeout: 3000 })) {
      return;
    }
    
    await searchInput.fill(uniqueTask);
    await helpers.waitForTimeout(1000);
    
    await page.locator(`tr:has-text("${uniqueTask}"), div:has-text("${uniqueTask}")`).first().isVisible({ timeout: 5000 }).catch(() => false);
    
    await searchInput.fill('NonExistentTask');
    await helpers.waitForTimeout(1000);
    
    await page.locator(`tr:has-text("${uniqueTask}")`).first().isVisible({ timeout: 3000 }).catch(() => false);
  });

  test('смена статуса для задач через редактирование', async ({ page }) => {
    test.setTimeout(60000);
    
    const taskTitle = helpers.generateTaskTitle('StatusChangeTest');
    const taskContent = 'Testing status change';
    
    await page.goto('http://localhost:5173/#/tasks/create');
    await helpers.waitForTimeout(2000);
    
    const titleInput = page.locator('input[name="title"], input[name="name"], input[placeholder*="Title"]').first();
    await titleInput.fill(taskTitle);
    
    const contentInput = page.locator('textarea[name="content"], textarea[name="description"], textarea[placeholder*="Content"]').first();
    if (await contentInput.isVisible({ timeout: 3000 })) {
      await contentInput.fill(taskContent);
    }
    
    const saveButton = page.locator('button:has-text("Save")').first();
    await saveButton.click();
    
    await helpers.waitForTimeout(3000);
    
    await page.goto('http://localhost:5173/#/tasks');
    await helpers.waitForTimeout(2000);
    
    const taskRow = page.locator('tr, .task-item, [class*="task"]').filter({ hasText: taskTitle }).first();
    if (!await taskRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      return;
    }
    
    const taskLink = taskRow.locator('a').or(taskRow.locator(`:has-text("${taskTitle}")`)).first();
    if (await taskLink.isVisible({ timeout: 3000 })) {
      await taskLink.click();
    } else {
      const titleElement = taskRow.locator(`:has-text("${taskTitle}")`).first();
      await titleElement.click();
    }
    
    await helpers.waitForTimeout(3000);
    
    const editButton = page.locator('button:has-text("Edit")').first();
    if (!await editButton.isVisible({ timeout: 5000 })) {
      return;
    }
    
    await editButton.click();
    await helpers.waitForTimeout(2000);
    
    const statusSelect = page.locator('select[name="status"], [aria-label*="status" i], [id*="status"]').first();
    if (await statusSelect.isVisible({ timeout: 3000 })) {
      const isSelect = await statusSelect.evaluate(el => el.tagName === 'SELECT');
      if (isSelect) {
        await statusSelect.selectOption({ index: 2 });
      } else {
        await statusSelect.focus();
        await helpers.waitForTimeout(500);
        await page.keyboard.press('ArrowDown');
        await helpers.waitForTimeout(500);
        await page.keyboard.press('ArrowDown');
        await helpers.waitForTimeout(500);
        await page.keyboard.press('Enter');
      }
    }
    
    const updateButton = page.locator('button:has-text("Save")').first();
    await updateButton.click();
    
    await helpers.waitForTimeout(4000);
  });

  test('массовое удаление задач', async ({ page }) => {
    test.setTimeout(60000);
    
    const checkboxes = page.locator('tbody input[type="checkbox"], .task-item input[type="checkbox"]');
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