const { expect } = require('@playwright/test')

class TasksPage {
  constructor(page) {
    this.page = page
    this.header = page.getByRole('heading', { name: 'Tasks' })
    this.createButton = page.getByRole('button', { name: 'CREATE' })
    this.saveButton = page.getByRole('button', { name: 'SAVE' })
    this.bulkDeleteButton = page.getByRole('button', { name: 'Delete' })
  }

  async waitForPageLoaded() {
    await expect(this.header).toBeVisible()
    await expect(this.createButton).toBeVisible()
  }

  get assigneeInput() { return this.page.getByLabel('Assignee*') }
  get titleInput() { return this.page.getByLabel('Title*') }
  get contentInput() { return this.page.getByLabel('Content') }
  get statusInput() { return this.page.getByLabel('Status*') }
  get labelInput() { return this.page.getByLabel('Label') }

  get assigneeFilter() { return this.page.locator('input[placeholder*="Assignee"]').first() }
  get statusFilter() { return this.page.locator('input[placeholder*="Status"]').first() }
  get labelFilter() { return this.page.locator('input[placeholder*="Label"]').first() }

  async clickCreateTask() {
    await this.createButton.click()
    await expect(this.titleInput).toBeVisible({ timeout: 5000 })
  }

  async clickEditForTask(title) {
    const row = this.page.locator('tr', { has: this.page.getByText(title) })
    await row.getByRole('button', { name: 'EDIT' }).first().click()
    await expect(this.titleInput).toBeVisible({ timeout: 5000 })
  }

  async clickDeleteForTask(title) {
    const row = this.page.locator('tr', { has: this.page.getByText(title) })
    await row.getByRole('button', { name: 'Delete' }).click()
  }

  async fillTaskForm({ assignee, title, content, status, label }) {
    if (assignee !== undefined) {
      await this.assigneeInput.click()
      await this.page.getByRole('option', { name: assignee }).click()
    }
    if (title !== undefined) {
      await this.titleInput.clear()
      await this.titleInput.fill(title)
    }
    if (content !== undefined) {
      await this.contentInput.clear()
      await this.contentInput.fill(content)
    }
    if (status !== undefined) {
      await this.statusInput.click()
      await this.page.getByRole('option', { name: status }).click()
    }
    if (label !== undefined) {
      await this.labelInput.click()
      await this.page.getByRole('option', { name: label }).click()
    }
  }

  async saveTaskForm() {
    await this.saveButton.click()
  }

  async confirmDelete() {
    await this.page.getByRole('button', { name: 'Confirm' }).click()
  }

  async filterByAssignee(assigneeName) {
    await this.assigneeFilter.click()
    await this.page.getByRole('option', { name: assigneeName }).click()
  }

  async filterByStatus(statusName) {
    await this.statusFilter.click()
    await this.page.getByRole('option', { name: statusName }).click()
  }

  async clearFilters() {
    await this.assigneeFilter.click()
    await this.page.keyboard.press('Escape')
    
    await this.statusFilter.click()
    await this.page.keyboard.press('Escape')
    
    await this.labelFilter.click()
    await this.page.keyboard.press('Escape')
  }

  async selectAllTasks() {
    const bulkCheckbox = this.page.locator('thead input[type="checkbox"]')
    await bulkCheckbox.check()
  }

  async clickBulkDelete() {
    await this.bulkDeleteButton.click()
  }

  async verifyTaskInTable(title) {
    const row = this.page.locator('tr', { has: this.page.getByText(title) })
    await expect(row).toBeVisible()
  }

  async verifyTaskNotInTable(title) {
    const row = this.page.locator('tr', { has: this.page.getByText(title) })
    await expect(row).not.toBeVisible()
  }
}

module.exports = TasksPage