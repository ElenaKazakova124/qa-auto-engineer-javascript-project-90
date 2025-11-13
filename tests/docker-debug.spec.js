// tests/docker-debug.spec.js
import { test, expect } from '@playwright/test'

test('Docker Debug: проверка страницы в контейнере', async ({ page }) => {
  console.log('=== DOCKER DEBUG TEST STARTED ===')
  
  await page.goto('/')
  
  // Сделаем скриншот для отладки
  await page.screenshot({ path: '/project/debug-docker.png' })
  console.log('Screenshot saved to /project/debug-docker.png')
  
  // Проверим доступные элементы
  const inputs = await page.$$('input')
  console.log(`Found ${inputs.length} input elements`)
  
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]
    const type = await input.getAttribute('type')
    const name = await input.getAttribute('name')
    const placeholder = await input.getAttribute('placeholder')
    console.log(`Input ${i}: type=${type}, name=${name}, placeholder=${placeholder}`)
  }
  
  const buttons = await page.$$('button')
  console.log(`Found ${buttons.length} button elements`)
  
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i]
    const text = await button.textContent()
    console.log(`Button ${i}: "${text}"`)
  }
  
  console.log('=== DOCKER DEBUG TEST FINISHED ===')
})