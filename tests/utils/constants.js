const mainPageElements = {
    themeButtonLabel: 'Toggle theme',
    profileButtonLabel: 'Profile',
    logoutButtonLabel: 'Logout',
    welcomeText: 'Welcome',
    usersMenuItemLabel: 'Users',
    statusMenuItemLabel: 'Task statuses',
    labelMenuItemLabel: 'Labels',
    tasksMenuItemLabel: 'Tasks'
  }
  
  const authElements = {
    usernameLabel: 'Username*',
    passwordLabel: 'Password*',
    signInButton: 'SIGN IN'
  }
  
  const tableElements = {
    createButton: 'Create',
    exportButton: 'Export',
    showButton: 'SHOW',
    editButton: 'EDIT',
    searchInput: 'Search...'
  }
  
  const expectedData = {
    statuses: ['Draft', 'To Review', 'To Be Fixed', 'To Publish', 'Published'],
    labels: ['bug', 'feature', 'enhancement', 'task', 'critical'],
    users: ['john@google.com', 'jack@yahoo.com', 'jane@gmail.com', 'alice@hotmail.com']
  }
  
  module.exports = {
    mainPageElements,
    authElements,
    tableElements,
    expectedData
  }