import BasePage from './BasePage.js'

class DashboardPage extends BasePage {
  constructor(page) {
    super(page)
    this.profileButton = page.getByRole('button', { name: 'Profile' })
    this.usersMenuItem = page.getByRole('menuitem', { name: 'Users' })
    this.statusesMenuItem = page.getByRole('menuitem', { name: 'Task statuses' })
    this.labelsMenuItem = page.getByRole('menuitem', { name: 'Labels' })
    this.tasksMenuItem = page.getByRole('menuitem', { name: 'Tasks' })
  }

  async waitForPageLoaded() {
    await this.waitForElement(this.profileButton)
  }

  async openUsersList() {
    await this.click(this.usersMenuItem)
    await this.waitForPageLoad()
  }

  async openStatusesList() {
    await this.click(this.statusesMenuItem)
    await this.waitForPageLoad()
  }

  async openLabelsList() {
    await this.click(this.labelsMenuItem)
    await this.waitForPageLoad()
  }

  async openTasksList() {
    await this.click(this.tasksMenuItem)
    await this.waitForPageLoad()
  }

  async verifyDashboardElements() {
    await this.waitForElement(this.profileButton)
    await this.shouldSee('Welcome')
  }
}

export default DashboardPage