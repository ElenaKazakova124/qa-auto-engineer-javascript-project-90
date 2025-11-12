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
    createButton: 'CREATE',
    exportButton: 'EXPORT',
    showButton: 'SHOW',
    editButton: 'EDIT',
    deleteButton: 'Delete',
    searchInput: 'Search...'
  }
  
  const existingData = {
    statuses: ['Draft', 'To Review', 'To Be Fixed', 'To Publish', 'Published'],
    labels: ['bug', 'feature', 'enhancement', 'task', 'critical'],
    users: [
      'john@google.com',
      'jack@yahoo.com', 
      'jane@gmail.com',
      'alice@hotmail.com',
      'peter@outlook.com',
      'sarah@example.com',
      'michael@example.com',
      'emily@example.com'
    ]
  }
  
  const testUsers = {
    newUser: {
      email: 'testuser@example.com',
      firstName: 'Test',
      lastName: 'User'
    },
    updatedUser: {
      email: 'updateduser@example.com',
      firstName: 'Updated',
      lastName: 'User'
    },
    invalidUser: {
      email: 'invalid-email',
      firstName: 'Invalid',
      lastName: 'User'
    }
  }
  
  const testStatuses = {
    newStatus: {
      name: 'Test Status',
      slug: 'test-status'
    },
    updatedStatus: {
      name: 'Updated Status',
      slug: 'updated-status'
    }
  }
  
  module.exports = {
    mainPageElements,
    authElements,
    tableElements,
    existingData,
    testUsers,
    testStatuses
  }