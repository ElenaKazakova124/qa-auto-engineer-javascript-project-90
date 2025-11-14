// tests/pages/TasksPage.js
import BasePage from './BasePage.js'

class TasksPage extends BasePage {
  constructor(page) {
    super(page)
    this.createButton = page.locator('button:has-text("+ CREATE"), button:has-text("CREATE"), button:has-text("Create"), [aria-label*="create"], [aria-label*="add"]').first()
    this.nameField = page.getByLabel('Name*')
    this.descriptionField = page.getByLabel('Description')
    this.saveButton = page.locator('button:has-text("SAVE"), button[type="submit"]').first()
  }

  async waitForPageLoaded() {
    await Promise.race([
      this.createButton.waitFor({ state: 'visible', timeout: 20000 }),
      this.page.locator('button:has-text("Export")').waitFor({ state: 'visible', timeout: 20000 }),
      this.page.locator('h2:has-text("Tasks")').waitFor({ state: 'visible', timeout: 20000 })
    ])
  }

  async clickCreate() {
    await this.click(this.createButton)
    await this.waitForPageLoad()
  }

  async fillTaskForm(name, description = 'Test description') {
    await this.fill(this.nameField, name)
    await this.fill(this.descriptionField, description)
  }

  async clickSave() {
    await this.click(this.saveButton)
    await this.waitForPageLoad()
  }

  async createTask(name, description = 'Test description') {
    await this.clickCreate()
    await this.fillTaskForm(name, description)
    await this.clickSave()
  }
}

export default TasksPage