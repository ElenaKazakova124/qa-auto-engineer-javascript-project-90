import BasePage from './BasePage.js'

class TasksPage extends BasePage {
  constructor(page) {
    super(page)
    this.createButton = page.locator('span:has-text("Create")')
    this.exportButton = page.locator('span:has-text("Export")')
    this.assigneeField = page.getByLabel('Assignee')
    this.titleField = page.getByLabel('Title')
    this.contentField = page.getByLabel('Content')
    this.statusField = page.getByLabel('Status')
    this.labelField = page.getByLabel('Label')
    this.saveButton = page.locator('button:has-text("Save")')
    this.pageTitle = page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /Tasks?/i })
  }

  async waitForPageLoaded() {
    await Promise.race([
      this.pageTitle.waitFor({ state: 'visible', timeout: 15000 }),
      this.createButton.waitFor({ state: 'visible', timeout: 15000 }),
      this.exportButton.waitFor({ state: 'visible', timeout: 15000 })
    ])
    console.log('Tasks page loaded successfully')
  }

  async openCreateForm() {
    console.log('Opening create form for tasks...')
    await this.click(this.createButton)
    await this.waitForModal()
    await this.waitForElement(this.titleField, 10000)
  }

  async fillTaskForm(title, content = 'Test task content') {
    await this.fill(this.titleField, title)
    await this.fill(this.contentField, content)
  }

  async saveForm() {
    await this.click(this.saveButton)
  }

  async createTask(title, content = 'Test task content') {
    await this.openCreateForm()
    await this.fillTaskForm(title, content)
    await this.saveForm()
  }
}

export default TasksPage