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
  
  const expectedData = {
    statuses: ['Draft', 'To Review', 'To Be Fixed', 'To Publish', 'Published'],
    labels: ['bug', 'feature', 'enhancement', 'task', 'critical'],
    users: [
      { email: 'john@google.com', firstName: 'John', lastName: 'Doe' },
      { email: 'jack@yahoo.com', firstName: 'Jack', lastName: 'Jens' },
      { email: 'jane@gmail.com', firstName: 'Jane', lastName: 'Smith' },
      { email: 'alice@hotmail.com', firstName: 'Alice', lastName: 'Johnson' },
      { email: 'peter@outlook.com', firstName: 'Peter', lastName: 'Brown' },
      { email: 'sarah@example.com', firstName: 'Sarah', lastName: 'Wilson' },
      { email: 'michael@example.com', firstName: 'Michael', lastName: 'Davis' },
      { email: 'emily@example.com', firstName: 'Emily', lastName: 'Martinez' }
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
  
  module.exports = {
    mainPageElements,
    authElements,
    tableElements,
    expectedData,
    testUsers
  }