import BasePage from './BasePage.js'

class DashboardPage extends BasePage {
  constructor(page) {
    super(page)
    this.welcomeText = page.getByText('Welcome')
    this.tasksMenuItem = page.getByRole('menuitem', { name: 'Tasks' })
    this.usersMenuItem = page.getByRole('menuitem', { name: 'Users' })
    this.labelsMenuItem = page.getByRole('menuitem', { name: 'Labels' })
    this.statusesMenuItem = page.getByRole('menuitem', { name: 'Task statuses' })
  }

  async waitForPageLoaded() {
    await Promise.race([
      this.welcomeText.waitFor({ state: 'visible', timeout: 15000 }),
      this.tasksMenuItem.waitFor({ state: 'visible', timeout: 15000 })
    ])
    console.log('Dashboard page loaded successfully')
  }

  async openTasksList() {
    await this.click(this.tasksMenuItem)
    await this.waitForPageLoad()
  }

  async openUsersList() {
    await this.click(this.usersMenuItem)
    await this.waitForPageLoad()
  }

  async openLabelsList() {
    await this.click(this.labelsMenuItem)
    await this.waitForPageLoad()
  }

  async openStatusesList() {
    await this.click(this.statusesMenuItem)
    await this.waitForPageLoad()
  }
}

export default DashboardPage