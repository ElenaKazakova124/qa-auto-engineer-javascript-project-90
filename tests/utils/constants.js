const mainPageElements = {
  themeButtonLabel: 'Toggle theme',
  profileButtonLabel: 'Jane Doe', 
  logoutButtonLabel: 'Logout',
  welcomeText: 'Welcome to the administration', 
  usersMenuItemLabel: 'Users',
  statusesMenuItemLabel: 'Task statuses',
  labelsMenuItemLabel: 'Labels',
  tasksMenuItemLabel: 'Tasks',
  dashboardMenuItemLabel: 'Dashboard',
  searchPlaceholder: 'Search...'
};

const authElements = {
  usernameLabel: 'Username',
  passwordLabel: 'Password', 
  signInButton: 'SIGN IN'
};

const tableElements = {
  createButton: 'Create', 
  exportButton: 'Export',          
  showButton: 'Show',
  editButton: 'Edit', 
  deleteButton: 'Delete',          
  saveButton: 'Save',            
  saveChangesButton: 'Save changes',
  searchInput: 'Search...',
  selectAll: 'Select all',
  deleteSelected: 'Delete selected',
  confirmButton: 'Confirm',
  cancelButton: 'Cancel'
};

const formElements = {
  nameField: 'Name',
  slugField: 'Slug', 
  emailField: 'Email',
  firstNameField: 'First name',
  lastNameField: 'Last name',
  assigneeField: 'Assignee',
  titleField: 'Title',
  contentField: 'Content',
  statusField: 'Status',
  labelField: 'Label',
  descriptionField: 'Description'
};

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
};

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
};

const testStatuses = {
  newStatus: {
    name: 'Test Status',
    slug: 'test-status'
  },
  updatedStatus: {
    name: 'Updated Status', 
    slug: 'updated-status'
  }
};

const testTasks = {
  newTask: {
    title: 'Test Task',
    content: 'Test task description',
    assignee: 'michael@example.com',
    status: 'Draft',
    label: 'bug'
  },
  updatedTask: {
    title: 'Updated Task',
    content: 'Updated description',
    assignee: 'john@google.com',
    status: 'To Review',
    label: 'feature'
  }
};

const testLabels = {
  newLabel: {
    name: 'Test Label'
  },
  updatedLabel: {
    name: 'Updated Label'
  }
};

const kanbanStatuses = {
  todo: 'To Do',
  inProgress: 'In Progress', 
  done: 'Done'
};

export default {
  mainPageElements,
  authElements, 
  tableElements,
  formElements,
  existingData,
  testUsers,
  testStatuses,
  testTasks,   
  testLabels,  
  kanbanStatuses 
};