import BasePage from './BasePage.js'

class DashboardPage extends BasePage {
  constructor(page) {
    super(page)
    this.welcomeText = page.getByText('Welcome to the administration')
    this.tasksMenuItem = page.getByRole('menuitem', { name: 'Tasks' })
    this.usersMenuItem = page.getByRole('menuitem', { name: 'Users' })
    this.labelsMenuItem = page.getByRole('menuitem', { name: 'Labels' })
    this.statusesMenuItem = page.getByRole('menuitem', { name: 'Task statuses' })
  }

  async waitForPageLoaded() {
    await this.waitForElement(this.welcomeText, 15000)
    console.log('Dashboard page loaded successfully')
  }

  async openTasksList() {
    console.log('Opening Tasks list...')
    await this.click(this.tasksMenuItem)
    await this.waitForPageLoad()
  }

  async openUsersList() {
    console.log('Opening Users list...')
    await this.click(this.usersMenuItem)
    await this.waitForPageLoad()
  }

  async openLabelsList() {
    console.log('Opening Labels list...')
    await this.click(this.labelsMenuItem)
    await this.waitForPageLoad()
  }

  async openStatusesList() {
    console.log('Opening Statuses list...')
    await this.click(this.statusesMenuItem)
    await this.waitForPageLoad()
  }

  async verifyDashboardElements() {
    await this.waitForElement(this.welcomeText)
    await this.waitForElement(this.tasksMenuItem)
    await this.waitForElement(this.usersMenuItem)
    await this.waitForElement(this.labelsMenuItem)
    await this.waitForElement(this.statusesMenuItem)
    console.log('All dashboard elements are visible')
  }
}

export default DashboardPage