import BasePage from './BasePage.js'

class DashboardPage extends BasePage {
  constructor(page) {
    super(page)
    this.profileButton = page.getByRole('button', { name: 'Profile' })
    this.usersMenuItem = page.getByRole('menuitem', { name: 'Users' })
    this.statusesMenuItem = page.getByRole('menuitem', { name: 'Task statuses' })
    this.labelsMenuItem = page.getByRole('menuitem', { name: 'Labels' })
    this.tasksMenuItem = page.getByRole('menuitem', { name: 'Tasks' })
    this.welcomeText = page.getByText('Welcome')
  }

  async waitForPageLoaded() {
    await this.helpers.diagnosePageState(this.page, 'DashboardPage')
    
    await Promise.race([
      this.waitForElement(this.profileButton, 15000),
      this.waitForElement(this.welcomeText, 15000),
      this.waitForElement(this.usersMenuItem, 15000)
    ])
    
    console.log('Dashboard page loaded successfully')
  }

  async openUsersList() {
    console.log('Opening Users list...')
    await this.click(this.usersMenuItem)
    await this.waitForPageLoad()
    await this.helpers.diagnosePageState(this.page, 'After opening Users')
  }

  async openStatusesList() {
    console.log('Opening Statuses list...')
    await this.click(this.statusesMenuItem)
    await this.waitForPageLoad()
    await this.helpers.diagnosePageState(this.page, 'After opening Statuses')
  }

  async openLabelsList() {
    console.log('Opening Labels list...')
    await this.click(this.labelsMenuItem)
    await this.waitForPageLoad()
    await this.helpers.diagnosePageState(this.page, 'After opening Labels')
  }

  async openTasksList() {
    console.log('Opening Tasks list...')
    await this.click(this.tasksMenuItem)
    await this.waitForPageLoad()
    await this.helpers.diagnosePageState(this.page, 'After opening Tasks')
  }

  async verifyDashboardElements() {
    await this.waitForElement(this.profileButton)
    await this.waitForElement(this.welcomeText)
    await this.waitForElement(this.usersMenuItem)
    await this.waitForElement(this.statusesMenuItem)
    await this.waitForElement(this.labelsMenuItem)
    await this.waitForElement(this.tasksMenuItem)
    console.log('All dashboard elements are visible')
  }

  async logout() {
    console.log('Logging out from dashboard...')
    await this.helpers.logout(this.page)
  }
}

export default DashboardPage