import { test, expect } from '@playwright/test';
import LoginPage from './pages/LoginPage.js';
import DashboardPage from './pages/DashboardPage.js';
import TasksPage from './pages/TasksPage.js';
import helpers from './utils/helpers.js';

test.describe('Задачи', () => {
  let loginPage;
  let dashboardPage;
  let tasksPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    tasksPage = new TasksPage(page);
    await loginPage.login('admin', 'admin');
    await dashboardPage.waitForDashboard();
  });

  test('создание задачи в канбан-доске', async ({ page }) => {
    console.log('=== Тест создания задачи в канбан-доске ===');
    
    await tasksPage.goto();
    
    const taskTitle = `Kanban Task ${Date.now()}`;
    console.log(`Создаем задачу: "${taskTitle}"`);
    
    await tasksPage.createTask(taskTitle, 'Описание для канбан-задачи');
    
    await verifyTaskInKanbanBoard(page, taskTitle);
    
    console.log('=== Тест завершен успешно ===');
  });

  async function verifyTaskInKanbanBoard(page, taskTitle) {
    console.log(`Проверяем задачу в канбан-доске: "${taskTitle}"`);
    
    const kanbanCards = page.locator('.card, .task-card, .kanban-card, [class*="card"]');
    const cardsCount = await kanbanCards.count();
    console.log(`Найдено карточек в канбан-доске: ${cardsCount}`);
    
    let taskFound = false;
    
    for (let i = 0; i < cardsCount; i++) {
      const card = kanbanCards.nth(i);
      const cardText = await card.textContent();
      
      if (cardText && cardText.includes(taskTitle)) {
        console.log(`✅ Задача найдена в карточке #${i + 1}`);
        
        await expect(card).toBeVisible();
        
        await verifyCardElements(card, taskTitle);
        
        taskFound = true;
        break;
      }
    }
    
    if (!taskFound) {
      console.log('Ищем задачу по заголовку...');
      const titleElements = page.locator('h1, h2, h3, h4, h5, h6, .title, .task-title').filter({ hasText: taskTitle });
      
      if (await titleElements.count() > 0) {
        console.log('✅ Задача найдена по заголовку');
        await expect(titleElements.first()).toBeVisible();
        taskFound = true;
      }
    }
    
    if (!taskFound) {
      console.log('Используем helpers.shouldSee...');
      await helpers.shouldSee(page, taskTitle);
      taskFound = true;
    }
    
    if (!taskFound) {
      await page.screenshot({ path: `kanban-not-found-${Date.now()}.png` });
      throw new Error(`Задача "${taskTitle}" не найдена в канбан-доске`);
    }
    
    console.log('✅ Задача успешно создана и отображается в канбан-доске');
  }

  async function verifyCardElements(card, taskTitle) {
    const elementsToCheck = [
      { selector: '.title, .task-title, h4, h5', description: 'заголовок' },
      { selector: '.content, .description, p', description: 'описание' },
      { selector: '.status, .badge', description: 'статус' },
      { selector: '.assignee, .user', description: 'исполнитель' },
      { selector: 'button:has-text("Edit")', description: 'кнопка Edit' },
      { selector: 'button:has-text("Show")', description: 'кнопка Show' }
    ];
    
    for (const element of elementsToCheck) {
      const locator = card.locator(element.selector);
      if (await locator.count() > 0) {
        console.log(`✅ Найден ${element.description} в карточке`);
      }
    }
  }
});