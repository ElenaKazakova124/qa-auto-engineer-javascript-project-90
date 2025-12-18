import { expect } from '@playwright/test';
import BasePage from './BasePage.js';
import helpers from '../utils/helpers.js';

class TasksPage extends BasePage {
  constructor(page) {
    super(page);
    
    this.tasksMenuItem = page.locator('a:has-text("Tasks"), [href*="tasks"]').first();
    this.createButton = page.locator('a:has-text("Create"), button:has-text("Create")').first();
    
    this.assigneeField = page.locator('[name="assignee"], select[name="assignee"], input[placeholder*="Assignee"]').first();
    this.titleField = page.locator('[name="title"], input[placeholder*="Title"]').first();
    this.contentField = page.locator('[name="content"], textarea[placeholder*="Content"]').first();
    this.statusField = page.locator('[name="status"], select[name="status"], input[placeholder*="Status"]').first();
    this.labelField = page.locator('select[name="label"], [name="label"]').first();
    this.saveButton = page.locator('button:has-text("Save"), button[type="submit"]').first();
    
    this.editButton = page.locator('button:has-text("Edit")').first();
    this.deleteButton = page.locator('button:has-text("Delete")').first();
    this.confirmDeleteButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
    
    this.snackbar = page.locator('.MuiSnackbar-root, [role="status"], .snackbar').first();
    this.undoButton = page.locator('button:has-text("UNDO")').first();
    
    this.kanbanColumns = page.locator('.column, [class*="column"], .lane, section, article, [class*="Column"], [class*="Lane"], [class*="Status"]');
    this.taskCards = page.locator('.task-card, .card, [class*="task"], [role="article"], [data-test*="task"], tbody tr');
    this.tableRows = page.locator('tbody tr');
    this.selectAllCheckbox = this.page.locator('thead input[type="checkbox"], input[aria-label="Select all"]').first();
  }

  async goto() {
    await expect(this.tasksMenuItem).toBeVisible({ timeout: 15000 });
    await this.tasksMenuItem.click();
    await expect(this.createButton).toBeVisible({ timeout: 15000 });
    return true;
  }

  async openCreateForm() {
    const loaded = await this.goto();
    expect(loaded).toBe(true);
    await expect(this.createButton).toBeVisible({ timeout: 15000 });
    await this.createButton.click();
    await expect(this.titleField).toBeVisible({ timeout: 15000 });
    return true;
  }

  async createTask(title = null, content = null) {
    const taskTitle = title || `Task ${Date.now()} ${Math.random().toString(36).substr(2, 5)}`;
    const taskContent = content || `Description of ${taskTitle}`;
    
    await this.openCreateForm();
    await expect(this.titleField).toBeVisible({ timeout: 15000 });
    await this.titleField.fill(taskTitle);
    await expect(this.contentField).toBeVisible({ timeout: 15000 });
    await this.contentField.fill(taskContent);
    await expect(this.saveButton).toBeVisible({ timeout: 15000 });
    await this.saveButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    await Promise.any([
      expect(this.createButton).toBeVisible({ timeout: 15000 }),
      this.page.waitForURL(url => url.toString().includes('/#/tasks') || url.toString().includes('/#/kanban'), { timeout: 15000 }),
      expect(this.snackbar).toBeVisible({ timeout: 15000 }),
    ]);
    return { title: taskTitle, content: taskContent };
  }

  async findTask(taskTitle) {
    const taskElement = this.page.locator('tbody tr, .task-card, .card, [data-test*="task"], [role="article"]').filter({ hasText: taskTitle }).first();
    const isVisible = await taskElement.isVisible({ timeout: 5000 }).catch(() => false);
    return isVisible ? taskElement : null;
  }

  async isTaskVisible(taskTitle) {
    return await this.page.locator('tbody tr, .task-card, .card, [data-test*="task"], [role="article"]').filter({ hasText: taskTitle }).first().isVisible({ timeout: 5000 }).catch(() => false);
  }

  async editTask(oldTitle, newTitle = null, newContent = null) {
    const taskElement = await this.findTask(oldTitle);
    await expect(taskElement).toBeVisible({ timeout: 15000 });
    await taskElement.click({ force: true });
    await expect(this.editButton).toBeVisible({ timeout: 15000 });
    await this.editButton.click();
    await expect(this.titleField).toBeVisible({ timeout: 15000 });
    if (newTitle !== null) {
      await this.titleField.fill(newTitle);
    }
    if (newContent !== null) {
      await expect(this.contentField).toBeVisible({ timeout: 15000 });
      await this.contentField.fill(newContent);
    }
    await expect(this.saveButton).toBeVisible({ timeout: 15000 });
    await this.saveButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    return { title: newTitle || oldTitle, content: newContent };
  }

  async deleteTask(taskTitle) {
    const taskElement = await this.findTask(taskTitle);
    await expect(taskElement).toBeVisible({ timeout: 15000 });
    await taskElement.click({ force: true });
    await expect(this.deleteButton).toBeVisible({ timeout: 15000 });
    await this.deleteButton.click();
    await expect(this.confirmDeleteButton).toBeVisible({ timeout: 15000 });
    await this.confirmDeleteButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.goto();
    await this.page.waitForLoadState('domcontentloaded');
    return true;
  }

  async massDeleteTasks() {
    await this.goto();
    await helpers.massDelete(this.page);
    return true;
  }

  async moveTaskBetweenColumns(taskTitle, fromColumn, toColumn) {
    await this.goto();
    const moved = await helpers.moveTaskBetweenColumns(this.page, taskTitle, fromColumn, toColumn);
    expect(moved).toBe(true);
    await this.goto();
    const targetColumn = this.page.locator(`:has-text("${toColumn}")`).first();
    const taskInTargetColumn = targetColumn.locator(`:has-text("${taskTitle}")`).first();
    await expect(taskInTargetColumn).toBeVisible({ timeout: 15000 });
    return true;
  }

  async changeTaskStatus(taskTitle, newStatus) {
    const taskElement = await this.findTask(taskTitle);
    await expect(taskElement).toBeVisible({ timeout: 15000 });
    await taskElement.click({ force: true });
    await expect(this.editButton).toBeVisible({ timeout: 15000 });
    await this.editButton.click();
    await expect(this.statusField).toBeVisible({ timeout: 15000 });
    const isSelect = await this.statusField.evaluate(el => el.tagName === 'SELECT');
    if (isSelect) {
      await this.statusField.selectOption({ label: newStatus });
    } else {
      await this.statusField.fill(newStatus);
    }
    await expect(this.saveButton).toBeVisible({ timeout: 15000 });
    await this.saveButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.goto();
    await this.page.waitForLoadState('domcontentloaded');
    const taskElementAfterEdit = await this.findTask(taskTitle);
    await expect(taskElementAfterEdit).toBeVisible({ timeout: 15000 });
    const taskText = await taskElementAfterEdit.textContent({ timeout: 2000 });
    expect(taskText || '').toContain(newStatus);
    return { title: taskTitle, status: newStatus };
  }

  async isCreateButtonAvailable() {
    await this.goto();
    await expect(this.createButton).toBeVisible({ timeout: 15000 });
    return true;
  }

  async getTaskCount() {
    await this.goto();
    const tableCount = await this.tableRows.count();
    const cardCount = await this.taskCards.count();
    return Math.max(tableCount, cardCount);
  }

  async getColumnCount() {
    await this.goto();
    return await this.kanbanColumns.count();
  }
}

export default TasksPage;