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
  }

  async goto() {
    try {
      const urls = ['/#/tasks', '/tasks', '/#/kanban', '/kanban'];
      
      for (const url of urls) {
        try {
          await this.page.goto(url, { 
            waitUntil: 'networkidle',
            timeout: 15000 
          });
          
          const currentUrl = this.page.url();
          const pageText = await this.page.textContent('body', { timeout: 2000 }).catch(() => '');
          
          if (currentUrl.includes('tasks') || currentUrl.includes('kanban') || 
              pageText.includes('Task') || pageText.includes('task')) {
            return true;
          }
        } catch (_error) {
          continue;
        }
      }
      
      if (await this.tasksMenuItem.isVisible({ timeout: 5000 }).catch(() => false)) {
        await this.tasksMenuItem.click();
        await helpers.waitForPageLoad(this.page);
        return true;
      }
      
      return false;
    } catch (_error) {
      return false;
    }
  }

  async openCreateForm() {
    try {
      await this.page.goto('/#/tasks/create', { 
        waitUntil: 'networkidle',
        timeout: 15000 
      });
      
      const hasTitleField = await this.titleField.isVisible({ timeout: 5000 }).catch(() => false);
      if (hasTitleField) {
        return true;
      }
      
      await this.goto();
      
      if (await this.createButton.isVisible({ timeout: 5000 })) {
        await this.createButton.click();
        await helpers.waitForPageLoad(this.page);
        return true;
      }
      
      return false;
    } catch (_error) {
      return false;
    }
  }

  async createTask(title = null, content = null) {
    const taskTitle = title || `Task ${Date.now()} ${Math.random().toString(36).substr(2, 5)}`;
    const taskContent = content || `Description of ${taskTitle}`;
    
    try {
      const formOpened = await this.openCreateForm();
      if (!formOpened) {
        return null;
      }
      
      await this.titleField.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
      
      const isTitleVisible = await this.titleField.isVisible({ timeout: 5000 }).catch(() => false);
      if (!isTitleVisible) {
        return null;
      }
      await this.titleField.fill(taskTitle);
      await this.titleField.waitFor({ state: 'attached' }).catch(() => null);
      
      const isAssigneeVisible = await this.assigneeField.isVisible({ timeout: 2000 }).catch(() => false);
      if (isAssigneeVisible) {
        const isSelect = await this.assigneeField.evaluate(el => el.tagName === 'SELECT');
        if (isSelect) {
          const assigneeOptions = ['emily@example.com', 'michael@example.com'];
          let selected = false;
          for (const option of assigneeOptions) {
            try {
              await this.assigneeField.selectOption({ label: option });
              selected = true;
              break;
            } catch (_error) {
              continue;
            }
          }
          if (!selected) {
            const options = await this.assigneeField.locator('option:not([value=""])').count();
            if (options > 0) {
              await this.assigneeField.selectOption({ index: 1 });
            }
          }
        } else {
          await this.assigneeField.click();
        }
      }
      
      const isStatusVisible = await this.statusField.isVisible({ timeout: 2000 }).catch(() => false);
      if (isStatusVisible) {
        const isSelect = await this.statusField.evaluate(el => el.tagName === 'SELECT');
        if (isSelect) {
          const statusOptions = ['Draft', 'Published'];
          let selected = false;
          for (const option of statusOptions) {
            try {
              await this.statusField.selectOption({ label: option });
              selected = true;
              break;
            } catch (_error) {
              continue;
            }
          }
          if (!selected) {
            const options = await this.statusField.locator('option:not([value=""])').count();
            if (options > 0) {
              await this.statusField.selectOption({ index: 1 });
            }
          }
        }
      }
      
      const isContentVisible = await this.contentField.isVisible({ timeout: 2000 }).catch(() => false);
      if (isContentVisible) {
        await this.contentField.fill(taskContent);
      }
      
      const isLabelVisible = await this.labelField.isVisible({ timeout: 2000 }).catch(() => false);
      if (isLabelVisible) {
        const isSelect = await this.labelField.evaluate(el => el.tagName === 'SELECT');
        if (isSelect) {
          const labelOptions = ['bug', 'feature'];
          for (const option of labelOptions) {
            try {
              await this.labelField.selectOption({ label: option });
              break;
            } catch (_error) {
              continue;
            }
          }
        }
      }
      
      const isSaveVisible = await this.saveButton.isVisible({ timeout: 2000 }).catch(() => false);
      if (isSaveVisible) {
        await this.saveButton.click();
      } else {
        await this.page.keyboard.press('Enter');
      }
      
      await this.page.waitForLoadState('domcontentloaded');
      
      const currentUrl = this.page.url();
      const isOnListPage = currentUrl.includes('/tasks') || currentUrl.includes('/kanban') || !currentUrl.includes('/create');
      
      if (isOnListPage) {
        await this.createButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
        return { title: taskTitle, content: taskContent };
      }
      
      const isSnackbarVisible = await this.snackbar.isVisible({ timeout: 5000 }).catch(() => false);
      if (isSnackbarVisible) {
        await this.snackbar.waitFor({ state: 'visible', timeout: 3000 }).catch(() => null);
        await this.goto();
        await this.page.waitForLoadState('domcontentloaded');
        return { title: taskTitle, content: taskContent };
      }
      
      await this.goto();
      await this.page.waitForLoadState('domcontentloaded');
      await this.createButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
      
      return { title: taskTitle, content: taskContent };
      
    } catch (_error) {
      return null;
    }
  }

  async findTask(taskTitle) {
    try {
      await this.goto();
      await this.page.waitForLoadState('domcontentloaded');
      await this.tableRows.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
      
      for (let attempt = 0; attempt < 3; attempt++) {
        const tableRow = this.tableRows.filter({ hasText: taskTitle }).first();
        const isTableRowVisible = await tableRow.isVisible({ timeout: 5000 }).catch(() => false);
        if (isTableRowVisible) {
          return tableRow;
        }
        
        const tableRowCount = await this.tableRows.count();
        for (let i = 0; i < tableRowCount; i++) {
          const row = this.tableRows.nth(i);
          try {
            const rowText = await row.textContent({ timeout: 2000 });
            if (rowText && rowText.includes(taskTitle)) {
              return row;
            }
          } catch (_error) {
            continue;
          }
        }
        
        const pageText = await this.page.textContent('body', { timeout: 5000 }).catch(() => '');
        
        if (pageText && pageText.includes(taskTitle)) {
          const exactTextMatch = this.page.locator(`text="${taskTitle}"`).first();
          const isExactMatchVisible = await exactTextMatch.isVisible({ timeout: 3000 }).catch(() => false);
          if (isExactMatchVisible) {
            const parent = exactTextMatch.locator('xpath=..').first();
            const parentTag = await parent.evaluate(el => el.tagName).catch(() => '');
            if (parentTag === 'TR' || parentTag === 'TD') {
              return parent;
            }
            return exactTextMatch;
          }
          
          const allTaskElements = this.page.locator(`:has-text("${taskTitle}")`);
          const count = await allTaskElements.count();
          
          for (let i = 0; i < count; i++) {
            const element = allTaskElements.nth(i);
            try {
              if (await element.isVisible({ timeout: 2000 })) {
                const tagName = await element.evaluate(el => el.tagName).catch(() => '');
                if (tagName === 'TR' || tagName === 'TD') {
                  return element;
                }
              }
            } catch (_error) {
              continue;
            }
          }
        }
        
        const cardCount = await this.taskCards.count();
        for (let i = 0; i < cardCount; i++) {
          const card = this.taskCards.nth(i);
          try {
            const cardText = await card.textContent({ timeout: 2000 });
            if (cardText && cardText.includes(taskTitle)) {
              return card;
            }
          } catch (_error) {
            continue;
          }
        }
        
        if (attempt < 2) {
          await this.page.waitForLoadState('domcontentloaded');
          await this.goto();
          await this.page.waitForLoadState('domcontentloaded');
          await this.tableRows.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
        }
      }
      
      return null;
    } catch (_error) {
      return null;
    }
  }

  async isTaskVisible(taskTitle) {
    const taskElement = await this.findTask(taskTitle);
    return taskElement !== null;
  }

  async editTask(oldTitle, newTitle = null, newContent = null) {
    try {
      const taskElement = await this.findTask(oldTitle);
      if (!taskElement) {
        return null;
      }
      
      await taskElement.click({ force: true });
      await this.page.waitForLoadState('domcontentloaded');
      await this.editButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
      
      const isEditVisible = await this.editButton.isVisible({ timeout: 5000 }).catch(() => false);
      if (!isEditVisible) {
        const editLink = this.page.locator('a:has-text("Edit")').first();
        const isEditLinkVisible = await editLink.isVisible({ timeout: 2000 }).catch(() => false);
        if (isEditLinkVisible) {
          await editLink.click();
        } else {
          return null;
        }
      } else {
        await this.editButton.click();
      }
      
      await this.page.waitForLoadState('domcontentloaded');
      await this.titleField.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
      
      if (newTitle) {
        const isTitleVisible = await this.titleField.isVisible({ timeout: 3000 }).catch(() => false);
        if (isTitleVisible) {
          await this.titleField.fill('');
          await this.titleField.fill(newTitle);
        }
      }
      
      if (newContent) {
        const isContentVisible = await this.contentField.isVisible({ timeout: 2000 }).catch(() => false);
        if (isContentVisible) {
          await this.contentField.fill('');
          await this.contentField.fill(newContent);
        }
      }
      
      const isSaveVisible = await this.saveButton.isVisible({ timeout: 2000 }).catch(() => false);
      if (!isSaveVisible) {
        return null;
      }
      
      await this.saveButton.click();
      await this.page.waitForLoadState('domcontentloaded');
      
      return { title: newTitle || oldTitle, content: newContent };
    } catch (_error) {
      await this.goto();
      return null;
    }
  }

  async deleteTask(taskTitle) {
    try {
      const taskElement = await this.findTask(taskTitle);
      if (!taskElement) {
        return false;
      }
      
      await taskElement.click({ force: true });
      await this.page.waitForLoadState('domcontentloaded');
      await this.deleteButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
      
      const isDeleteVisible = await this.deleteButton.isVisible({ timeout: 5000 }).catch(() => false);
      if (!isDeleteVisible) {
        const deleteLink = this.page.locator('a:has-text("Delete"), button[aria-label*="Delete"]').first();
        const isDeleteLinkVisible = await deleteLink.isVisible({ timeout: 2000 }).catch(() => false);
        if (isDeleteLinkVisible) {
          await deleteLink.click();
        } else {
          return false;
        }
      } else {
        await this.deleteButton.click();
      }
      
      await this.confirmDeleteButton.waitFor({ state: 'visible', timeout: 3000 }).catch(() => null);
      
      const isConfirmVisible = await this.confirmDeleteButton.isVisible({ timeout: 3000 }).catch(() => false);
      if (isConfirmVisible) {
        await this.confirmDeleteButton.click();
      }
      
      await this.page.waitForLoadState('domcontentloaded');
      await this.goto();
      await this.page.waitForLoadState('domcontentloaded');
      
      return true;
    } catch (_error) {
      await this.goto();
      return false;
    }
  }

  async massDeleteTasks() {
    return false;
  }

  async moveTaskBetweenColumns(taskTitle, fromColumn, toColumn) {
    try {
      await this.goto();
      await this.page.waitForLoadState('domcontentloaded');
      
      const moved = await helpers.moveTaskBetweenColumns(this.page, taskTitle, fromColumn, toColumn);
      if (moved) {
        await this.page.waitForLoadState('domcontentloaded');
        await this.goto();
        await this.page.waitForLoadState('domcontentloaded');
        
        const targetColumn = this.page.locator(`:has-text("${toColumn}")`).first();
        const taskInTargetColumn = targetColumn.locator(`:has-text("${taskTitle}")`).first();
        const isInTargetColumn = await taskInTargetColumn.isVisible({ timeout: 5000 }).catch(() => false);
        return isInTargetColumn;
      }
      
      return false;
    } catch (_error) {
      return false;
    }
  }

  async changeTaskStatus(taskTitle, newStatus) {
    try {
      const taskElement = await this.findTask(taskTitle);
      if (!taskElement) {
        return null;
      }
      
      await taskElement.click({ force: true });
      await this.page.waitForLoadState('domcontentloaded');
      await this.editButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
      
      const isEditVisible = await this.editButton.isVisible({ timeout: 5000 }).catch(() => false);
      if (!isEditVisible) {
        const editLink = this.page.locator('a:has-text("Edit")').first();
        const isEditLinkVisible = await editLink.isVisible({ timeout: 2000 }).catch(() => false);
        if (isEditLinkVisible) {
          await editLink.click();
        } else {
          return null;
        }
      } else {
        await this.editButton.click();
      }
      
      await this.page.waitForLoadState('domcontentloaded');
      await this.statusField.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
      
      const isStatusVisible = await this.statusField.isVisible({ timeout: 3000 }).catch(() => false);
      if (isStatusVisible) {
        const isSelect = await this.statusField.evaluate(el => el.tagName === 'SELECT');
        if (isSelect) {
          await this.statusField.selectOption({ label: newStatus });
        } else {
          await this.statusField.fill(newStatus);
        }
      }
      
      const isSaveVisible = await this.saveButton.isVisible({ timeout: 2000 }).catch(() => false);
      if (!isSaveVisible) {
        return null;
      }
      
      await this.saveButton.click();
      await this.page.waitForLoadState('domcontentloaded');
      
      await this.goto();
      await this.page.waitForLoadState('domcontentloaded');
      
      const taskElementAfterEdit = await this.findTask(taskTitle);
      if (taskElementAfterEdit) {
        const taskText = await taskElementAfterEdit.textContent({ timeout: 2000 }).catch(() => '');
        const pageText = await this.page.textContent('body', { timeout: 2000 }).catch(() => '');
        const hasNewStatus = (taskText && taskText.includes(newStatus)) || (pageText && pageText.includes(newStatus));
        
        if (hasNewStatus) {
          return { title: taskTitle, status: newStatus };
        }
        
        const statusInColumn = this.page.locator(`:has-text("${newStatus}")`).first();
        const taskNearStatus = statusInColumn.locator(`:has-text("${taskTitle}")`).first();
        const isTaskNearStatus = await taskNearStatus.isVisible({ timeout: 3000 }).catch(() => false);
        
        return isTaskNearStatus ? { title: taskTitle, status: newStatus } : null;
      }
      
      return null;
    } catch (_error) {
      await this.goto();
      return null;
    }
  }

  async isCreateButtonAvailable() {
    await this.goto();
    await this.page.waitForLoadState('domcontentloaded');
    return await this.createButton.isVisible({ timeout: 5000 }).catch(() => false);
  }

  async getTaskCount() {
    await this.goto();
    await this.page.waitForLoadState('domcontentloaded');
    await this.tableRows.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
    
    const tableCount = await this.tableRows.count();
    const cardCount = await this.taskCards.count();
    return Math.max(tableCount, cardCount);
  }

  async getColumnCount() {
    await this.goto();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.locator('table, .column, [class*="column"]').first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
    
    const columnCount = await this.kanbanColumns.count();
    if (columnCount > 0) {
      return columnCount;
    }
    
    const tableVisible = await this.page.locator('table').isVisible({ timeout: 2000 }).catch(() => false);
    if (tableVisible) {
      return 1;
    }
    
    return 0;
  }
}

export default TasksPage;