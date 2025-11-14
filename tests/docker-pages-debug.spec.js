// tests/docker-pages-debug.spec.js
import { test, expect } from '@playwright/test'
import Helpers from './utils/helpers.js'

test('Docker: диагностика всех страниц', async ({ page }) => {
  console.log('=== DOCKER ДИАГНОСТИКА СТРАНИЦ ===')
  
  // Логинимся
  await Helpers.login(page, 'admin', 'admin')
  console.log('✅ Успешно залогинились в Docker')
  
  // Проверим все разделы
  const sections = [
    { name: 'statuses', url: '/#/task_statuses', label: 'Task statuses' },
    { name: 'labels', url: '/#/labels', label: 'Labels' },
    { name: 'tasks', url: '/#/tasks', label: 'Tasks' },
    { name: 'users', url: '/#/users', label: 'Users' }
  ]
  
  for (const section of sections) {
    console.log(`\n=== ПРОВЕРКА РАЗДЕЛА: ${section.name} ===`)
    
    // Переходим на страницу
    await page.goto(`http://localhost:5173${section.url}`)
    await page.waitForLoadState('networkidle')
    
    console.log(`URL: ${page.url()}`)
    
    // Ищем ВСЕ кнопки на странице
    const buttons = await page.$$('button')
    console.log(`Найдено ${buttons.length} кнопок:`)
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i]
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      const className = await button.getAttribute('class')
      console.log(`Кнопка ${i}: text="${text?.trim()}", aria-label="${ariaLabel}", class="${className?.substring(0, 50)}"`)
    }
    
    // Ищем элементы создания
    const createSelectors = [
      'button:has-text("+ CREATE")',
      'button:has-text("CREATE")',
      'button:has-text("Create")',
      'button:has-text("create")',
      'button:has-text("+ Create")',
      '[aria-label*="create"]',
      '[aria-label*="add"]',
      '[aria-label*="new"]'
    ]
    
    for (const selector of createSelectors) {
      const element = page.locator(selector)
      const count = await element.count()
      if (count > 0) {
        console.log(`✅ Найден элемент по селектору: ${selector}`)
        const isVisible = await element.first().isVisible()
        console.log(`   Видим: ${isVisible}, Количество: ${count}`)
      }
    }
    
    // Делаем скриншот для каждой страницы
    await page.screenshot({ path: `/project/debug-${section.name}.png` })
    console.log(`Скриншот сохранен: /project/debug-${section.name}.png`)
  }
  
  console.log('=== ЗАВЕРШЕНИЕ ДИАГНОСТИКИ ===')
})