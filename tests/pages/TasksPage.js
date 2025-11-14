import BasePage from './BasePage.js'

class TasksPage extends BasePage {
  constructor(page) {
    super(page)
    this.createButton = page.locator('button:has-text("+ CREATE")')
    this.nameField = page.getByLabel('Name*')
    this.descriptionField = page.getByLabel('Description')
    this.saveButton = page.locator('button:has-text("SAVE"), button[type="submit"]').first()
  }

  async waitForPageLoaded() {
    await this.waitForElement(this.createButton)
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