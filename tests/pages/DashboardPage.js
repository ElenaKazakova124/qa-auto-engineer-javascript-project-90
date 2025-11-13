import { BasePage } from './BasePage.js'

class DashboardPage extends BasePage {
  constructor(page) {
    super(page)
    this.profileButton = page.getByRole('button', { name: 'Profile' })
    this.logoutButton = page.getByRole('menuitem', { name: 'Logout' })
    this.welcomeText = page.getByText('Welcome')
    this.usersMenuItem = page.getByRole('menuitem', { name: 'Users' })
    this.statusMenuItem = page.getByRole('menuitem', { name: 'Task statuses' })
    this.labelMenuItem = page.getByRole('menuitem', { name: 'Labels' })
    this.tasksMenuItem = page.getByRole('menuitem', { name: 'Tasks' })
  }

  async waitForPageLoaded() {
    await this.waitForElement(this.profileButton)
    await this.waitForElement(this.welcomeText)
  }

  async verifyDashboardElements() {
    await this.waitForPageLoaded()
    await this.shouldSee('Welcome')
  }

  async openUsersList() {
    await this.click(this.usersMenuItem)
  }

  async openStatusesList() {
    await this.click(this.statusMenuItem)
  }

  async openLabelsList() {
    await this.click(this.labelMenuItem)
  }

  async openTasksList() {
    await this.click(this.tasksMenuItem)
  }

  async logout() {
    await this.click(this.profileButton)
    await this.click(this.logoutButton)
  }
}

export default DashboardPage