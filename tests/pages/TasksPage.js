import BasePage from './BasePage.js'

class TasksPage extends BasePage {
  constructor(page) {
    super(page)
    this.createButton = page.locator('button:has-text("Create")')
    this.nameField = page.getByLabel('Name')
    this.descriptionField = page.getByLabel('Description')
    this.saveButton = page.locator('button:has-text("Save")')
    this.pageTitle = page.locator('h1, h2, h3').filter({ hasText: /Tasks?/i })
  }

  async waitForPageLoaded() {
    await this.helpers.diagnosePageState(this.page, 'TasksPage')
    
    await Promise.race([
      this.pageTitle.waitFor({ state: 'visible', timeout: 15000 }),
      this.createButton.waitFor({ state: 'visible', timeout: 15000 }),
      this.page.locator('button:has-text("Export")').waitFor({ state: 'visible', timeout: 15000 })
    ])
  }

  async openCreateForm() {
    console.log('Opening create form for tasks...')
    await this.helpers.clickCreate(this.page)
    await this.waitForElement(this.nameField, 10000)
  }

  async fillTaskForm(name, description = '') {
    await this.fill(this.nameField, name)
    if (description && await this.descriptionField.isVisible()) {
      await this.fill(this.descriptionField, description)
    }
  }

  async saveForm() {
    await this.helpers.clickSave(this.page)
  }

  async createTask(name, description = '') {
    await this.openCreateForm()
    await this.fillTaskForm(name, description)
    await this.saveForm()
  }
}

export default TasksPage