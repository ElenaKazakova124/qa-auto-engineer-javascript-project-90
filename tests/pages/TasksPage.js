import BasePage from './BasePage.js'

class TasksPage extends BasePage {
  constructor(page) {
    super(page)
    this.createButton = page.locator('button:has-text("+ CREATE")')
    this.assigneeField = page.getByLabel('Assignee*')
    this.titleField = page.getByLabel('Title*')
    this.contentField = page.getByLabel('Content')
    this.statusField = page.getByLabel('Status*')
    this.labelField = page.getByLabel('Label')
    this.saveButton = page.locator('button:has-text("SAVE")')
    this.pageTitle = page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /Tasks?/i })
  }

  async waitForPageLoaded() {
    await this.waitForElement(this.pageTitle, 15000)
    await this.waitForElement(this.createButton, 10000)
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

  async clickEdit(taskTitle) {
    const taskRow = this.page.locator('tr', { has: this.page.getByText(taskTitle) })
    const editButton = taskRow.locator('button:has-text("EDIT")')
    await this.click(editButton)
    await this.waitForModal()
  }

  async clickShow(taskTitle) {
    const taskRow = this.page.locator('tr', { has: this.page.getByText(taskTitle) })
    const showButton = taskRow.locator('button:has-text("SHOW")')
    await this.click(showButton)
    await this.waitForPageLoad()
  }
}

export default TasksPage