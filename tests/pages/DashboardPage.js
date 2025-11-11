const { expect } = require('@playwright/test')
const { mainPageElements } = require('../utils/constants.js')

class DashboardPage {
  constructor(page) {
    this.page = page
    this.themeButton = page.getByRole('button', { name: mainPageElements.themeButtonLabel })
    this.profileButton = page.getByRole('button', { name: mainPageElements.profileButtonLabel })
    this.logoutButton = page.getByRole('menuitem', { name: mainPageElements.logoutButtonLabel })
    this.welcomeText = page.getByText(mainPageElements.welcomeText)
    this.usersMenuItem = page.getByRole('menuitem', { name: mainPageElements.usersMenuItemLabel })
    this.statusMenuItem = page.getByRole('menuitem', { name: mainPageElements.statusMenuItemLabel })
    this.labelMenuItem = page.getByRole('menuitem', { name: mainPageElements.labelMenuItemLabel })
    this.tasksMenuItem = page.getByRole('menuitem', { name: mainPageElements.tasksMenuItemLabel })
    this.dashboardHeader = page.getByRole('heading', { name: 'Dashboard' })
  }

  async waitForPageLoaded() {
    await expect(this.themeButton).toBeVisible()
    await expect(this.profileButton).toBeVisible()
    await expect(this.welcomeText).toBeVisible()

    if (await this.dashboardHeader.isVisible()) {
      await expect(this.dashboardHeader).toBeVisible()
    }
  }

  async openCurrentUserProfile() {
    await this.profileButton.click()
  }

  async logout() {
    await this.profileButton.click()
    await this.logoutButton.click()
  }

  async openUsersList() {
    await this.usersMenuItem.click()
  }

  async openStatusesList() {
    await this.statusMenuItem.click()
  }

  async openLabelsList() {
    await this.labelMenuItem.click()
  }

  async openTasksList() {
    await this.tasksMenuItem.click()
  }

  async verifyDashboardElements() {
    await this.waitForPageLoaded()
    const menuItems = [this.usersMenuItem, this.statusMenuItem, this.labelMenuItem, this.tasksMenuItem]
    for (const item of menuItems) {
      await expect(item).toBeVisible()
    }
  }
}

module.exports = DashboardPage