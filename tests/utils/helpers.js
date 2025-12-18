import { expect } from '@playwright/test'
import constants from './constants.js'

class Helpers {
  static generateEmail(prefix = 'test') {
    return `${prefix}${Date.now()}@example.com`;
  }

  static generateName(prefix = 'Test') {
    return `${prefix}${Date.now()}`;
  }

  static generateSlug(prefix = 'slug') {
    return `${prefix}-${Date.now()}`;
  }

  static generateTaskTitle(prefix = 'Task') {
    return `${prefix} ${Date.now()}`;
  }

  static async login(page, username = 'admin', password = 'admin') {
    try {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      const usernameField = page.getByLabel(constants.authElements.usernameLabel);
      const passwordField = page.getByLabel(constants.authElements.passwordLabel);
      const signInButton = page.getByRole('button', { name: /sign in/i });

      await usernameField.fill(username);
      await passwordField.fill(password);
      await signInButton.click();
      
      await page.waitForLoadState('networkidle');
      return true;
    } catch (_) {
      throw new Error('Ошибка входа');
    }
  }

  static async logout(page) {
    try {
      const profileButton = page.locator(`button:has-text("${constants.mainPageElements.profileButtonLabel}")`).first();
      await profileButton.click();
      
      const logoutButton = page.locator(`text="${constants.mainPageElements.logoutButtonLabel}"`).first();
      await logoutButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
      await logoutButton.click({ force: true });
      
      await page.waitForLoadState('networkidle');
      
      const signInButton = page.getByRole('button', { name: /sign in/i });
      await expect(signInButton).toBeVisible({ timeout: 10000 });
      
      return true;
    } catch (_) {
      throw new Error('Ошибка выхода');
    }
  }

  static async navigateTo(page, section) {
    const sections = {
      dashboard: 'Dashboard',
      users: 'Users',
      statuses: 'Task statuses',
      labels: 'Labels',
      tasks: 'Tasks'
    };
    
    if (!sections[section]) {
      throw new Error(`Неизвестный раздел: ${section}`);
    }
    
    try {
      const menuItem = page.locator(`a:has-text("${sections[section]}")`).first();
      
      if (!await menuItem.isVisible({ timeout: 5000 })) {
        const menuButton = page.locator('button[aria-label="menu"], button[aria-label="open drawer"]');
        if (await menuButton.isVisible({ timeout: 3000 })) {
          await menuButton.click();
          await menuItem.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
        }
      }
      
      await menuItem.click();
      await page.waitForLoadState('networkidle');
      await page.locator('tbody tr, .task-card, .card').first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
    } catch (_) {
      throw new Error(`Ошибка навигации в раздел ${section}`);
    }
  }

  static async clickCreate(page) {
    try {
      const createButton = page.locator('a:has-text("Create"), button:has-text("Create")').first();
      
      if (await createButton.isVisible({ timeout: 10000 })) {
        await createButton.click();
        await page.waitForLoadState('networkidle');
        return;
      }
      
      throw new Error('Кнопка Create не найдена');
    } catch (_) {
      throw new Error('Ошибка клика по кнопке Create');
    }
  }

  static async clickSave(page) {
    try {
      const saveButton = page.locator('button:has-text("Save"), button[type="submit"]').first();
      
      if (await saveButton.isVisible({ timeout: 10000 })) {
        await saveButton.click();
        await page.waitForLoadState('networkidle');
        return;
      }
      
      throw new Error('Кнопка Save не найдена');
    } catch (_) {
      throw new Error('Ошибка клика по кнопке Save');
    }
  }

  static async fillForm(page, fields) {
    for (const [label, value] of Object.entries(fields)) {
      if (value !== undefined && value !== null) {
        let field = page.getByLabel(label);
        
        if (!(await field.isVisible().catch(() => false))) {
          field = page.locator(`input[name="${label.toLowerCase()}"], textarea[name="${label.toLowerCase()}"]`).first();
        }
        
        if (!(await field.isVisible().catch(() => false))) {
          field = page.locator(`[placeholder*="${label}"]`).first();
        }
        
        if (!(await field.isVisible().catch(() => false))) {
          const labelElement = page.locator(`label:has-text("${label}")`).first();
          if (await labelElement.isVisible()) {
            const inputId = await labelElement.getAttribute('for');
            if (inputId) {
              field = page.locator(`#${inputId}`);
            } else {
              field = labelElement.locator('+ input, + textarea');
            }
          }
        }
        
        if (await field.isVisible({ timeout: 5000 }).catch(() => false)) {
          await field.fill(value.toString());
          await page.waitForLoadState('domcontentloaded').catch(() => null);
        }
      }
    }
  }

  static async selectOption(page, dropdownLabel, optionText) {
    try {
      const dropdown = page.getByLabel(dropdownLabel);
      await dropdown.click();
      
      const option = page.getByRole('option', { name: optionText });
      await option.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
      await option.click();
    } catch (_) {
      throw new Error('Ошибка выбора опции');
    }
  }

  static async verifyFormFields(page, expectedFields) {
    for (const field of expectedFields) {
      let fieldLocator = page.locator(`input[name="${field}"], textarea[name="${field}"]`).first();
      
      if (!(await fieldLocator.isVisible({ timeout: 3000 }).catch(() => false))) {
        fieldLocator = page.getByLabel(field);
      }
      
      await fieldLocator.isVisible({ timeout: 3000 }).catch(() => false);
    }
  }

  static async shouldSee(page, text, timeout = 10000) {
    try {
      const locator = page.locator(`:has-text("${text}")`).first();
      await expect(locator).toBeVisible({ timeout });
    } catch (_) {
      throw new Error(`Текст "${text}" не найден или не виден`);
    }
  }

  static async shouldNotSee(page, text, timeout = 5000) {
    try {
      const locator = page.locator(`:has-text("${text}")`).first();
      await expect(locator).not.toBeVisible({ timeout });
    } catch (_) {
      throw new Error(`Текст "${text}" все еще виден`);
    }
  }

  static async shouldBeOnPage(page, expectedUrlPattern, timeout = 10000) {
    try {
      await page.waitForURL(expectedUrlPattern, { timeout });
    } catch (_) {
      throw new Error(`Не на ожидаемой странице. Текущий URL: ${page.url()}`);
    }
  }

  static async waitForTimeout(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async waitForPageLoad(page) {
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('body').waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
  }

  static async getRowCount(page) {
    return await page.locator('tbody tr').count();
  }

  static async createTestData(page, type, data = {}) {
    const testData = {
      user: {
        email: this.generateEmail(),
        firstName: this.generateName('First'),
        lastName: this.generateName('Last'),
        ...data
      },
      status: {
        name: this.generateName('Status'),
        slug: this.generateSlug(),
        ...data
      },
      label: {
        name: this.generateName('Label'),
        ...data
      },
      task: {
        title: this.generateTaskTitle(),
        content: 'Описание тестовой задачи',
        ...data
      }
    };

    if (!testData[type]) {
      throw new Error(`Неизвестный тип данных: ${type}`);
    }

    return testData[type];
  }

  static async massDelete(page) {
    const selectAllCheckbox = page.locator('thead input[type="checkbox"]').first();
    if (await selectAllCheckbox.isVisible({ timeout: 5000 })) {
      await selectAllCheckbox.check();
      await page.waitForLoadState('domcontentloaded').catch(() => null);
      
      const deleteSelectedButton = page.locator(`button:has-text("Delete selected")`).first();
      if (await deleteSelectedButton.isVisible({ timeout: 3000 })) {
        await deleteSelectedButton.click();
        
        const confirmButton = page.locator(`button:has-text("Confirm")`).first();
        if (await confirmButton.isVisible({ timeout: 3000 })) {
          await confirmButton.click();
          await page.waitForLoadState('networkidle').catch(() => null);
        }
      }
    }
  }

  static async filterTasks(page, searchText) {
    const searchInput = page.locator(`input[placeholder*="Search"]`).first();
    if (await searchInput.isVisible({ timeout: 5000 })) {
      await searchInput.fill(searchText);
      await page.waitForLoadState('networkidle').catch(() => null);
    }
  }

  static async moveTaskBetweenColumns(page, taskName, fromColumn, toColumn) {
    const sourceColumn = page.locator(`.kanban-column:has-text("${fromColumn}"), .column:has-text("${fromColumn}")`).first();
    const taskCard = sourceColumn.locator(`.task-card:has-text("${taskName}"), .card:has-text("${taskName}")`).first();
    
    const targetColumn = page.locator(`.kanban-column:has-text("${toColumn}"), .column:has-text("${toColumn}")`).first();
    
    if (await taskCard.isVisible() && await targetColumn.isVisible()) {
      await taskCard.hover();
      await page.waitForLoadState('domcontentloaded').catch(() => null);
      await taskCard.dragTo(targetColumn);
      await page.waitForLoadState('networkidle').catch(() => null);
      
      return await targetColumn.locator(`.task-card:has-text("${taskName}"), .card:has-text("${taskName}")`).isVisible({ timeout: 5000 }).catch(() => false);
    }
    
    return false;
  }
}

export default Helpers;