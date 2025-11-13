import BasePage from './BasePage.js'

class TasksPage extends BasePage {
  constructor(page) {
    super(page)
    this.header = page.getByRole('heading', { name: 'Tasks' })
    this.createButton = page.getByRole('button', { name: 'CREATE' })
    this.saveButton = page.getByRole('button', { name: 'SAVE' })
    this.titleInput = page.getByLabel('Title*')
    this.contentInput = page.getByLabel('Content')
    this.assigneeInput = page.getByLabel('Assignee*')
    this.statusInput = page.getByLabel('Status*')
    this.labelInput = page.getByLabel('Label')
  }

  async waitForPageLoaded() {
    await this.waitForElement(this.header)
    await this.waitForElement(this.createButton)
  }

  async createTask(title, content, assignee, status, label) {
    await this.click(this.createButton)
    await this.fill(this.titleInput, title)
    await this.fill(this.contentInput, content)
    await this.selectOption(this.assigneeInput, assignee)
    await this.selectOption(this.statusInput, status)
    if (label) {
      await this.selectOption(this.labelInput, label)
    }
    await this.click(this.saveButton)
  }

  async selectOption(dropdown, optionText) {
    await dropdown.click()
    await this.page.getByRole('option', { name: optionText }).click()
  }

  async filterByAssignee(assignee) {
    await this.helpers.filterByAssignee(this.page, assignee)
  }

  async filterByStatus(status) {
    await this.helpers.filterByStatus(this.page, status)
  }

  async filterByLabel(label) {
    await this.helpers.filterByLabel(this.page, label)
  }

  async clearFilters() {
    await this.helpers.clearFilters(this.page)
  }

  async verifyTasksTable() {
    const hasTable = await this.page.locator('tbody tr').count() > 0
    const hasFilters = await this.page.locator('input[placeholder*="Assignee"]').isVisible()
    
    if (!hasTable && !hasFilters) {
      throw new Error('Tasks page not loaded properly')
    }
  }
}

export default TasksPage