// tests/debug-login.spec.js
import { test, expect } from '@playwright/test'

test('Debug: проверка страницы логина', async ({ page }) => {
  console.log('=== НАЧАЛО ОТЛАДОЧНОГО ТЕСТА ===')
  
  // Используем правильный URL вашего приложения
  const appUrl = 'http://localhost:5173'
  
  console.log('Пробуем перейти по URL:', appUrl)
  await page.goto(appUrl)
  
  // Сделайте скриншот
  await page.screenshot({ path: 'debug-login.png' })
  console.log('Скриншот сохранен как debug-login.png')
  
  // Выведите HTML страницы
  const html = await page.content()
  console.log('HTML страницы (первые 1000 символов):')
  console.log(html.substring(0, 1000))
  
  // Проверьте все input элементы
  const inputs = await page.$$('input')
  console.log('Найдено input элементов:', inputs.length)
  
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]
    const type = await input.getAttribute('type')
    const name = await input.getAttribute('name')
    const placeholder = await input.getAttribute('placeholder')
    const id = await input.getAttribute('id')
    console.log(`Input ${i}: type=${type}, name=${name}, placeholder=${placeholder}, id=${id}`)
  }
  
  // Проверьте все label элементы
  const labels = await page.$$('label')
  console.log('Найдено label элементов:', labels.length)
  
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i]
    const text = await label.textContent()
    const htmlFor = await label.getAttribute('for')
    console.log(`Label ${i}: text="${text}", for="${htmlFor}"`)
  }

  // Проверьте все button элементы
  const buttons = await page.$$('button')
  console.log('Найдено button элементов:', buttons.length)
  
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i]
    const text = await button.textContent()
    const type = await button.getAttribute('type')
    console.log(`Button ${i}: text="${text?.trim()}", type=${type}`)
  }
  
  console.log('=== КОНЕЦ ОТЛАДОЧНОГО ТЕСТА ===')
})