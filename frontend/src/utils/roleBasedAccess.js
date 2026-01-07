// Role-based access control utilities

export const ROLES = {
  ADMIN: 'ADMIN',
  ACCOUNTS: 'ACCOUNTS',
  ADMISSIONS: 'ADMISSIONS',
  HOSTEL_WARDEN: 'HOSTEL_WARDEN',
  LIBRARIAN: 'LIBRARIAN',
  EXAM_CELL: 'EXAM_CELL',
  STUDENT: 'STUDENT',
};

// Define which roles can access which routes
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    'dashboard',
    'students',
    'finance',
    'hostel',
    'library',
    'exams',
    'courses',
    'users',
    '*', // Admin has access to everything
  ],
  [ROLES.ACCOUNTS]: [
    'dashboard',
    'finance',
    'students', // View only for fee collection
  ],
  [ROLES.ADMISSIONS]: [
    'dashboard',
    'students',
    'courses', // View courses for admission
  ],
  [ROLES.HOSTEL_WARDEN]: [
    'dashboard',
    'hostel',
    'students', // View only for allocation
  ],
  [ROLES.LIBRARIAN]: [
    'dashboard',
    'library',
    'students', // View only for book issue
  ],
  [ROLES.EXAM_CELL]: [
    'dashboard',
    'exams',
    'students', // View only for marks entry
    'courses',
  ],
  [ROLES.STUDENT]: [
    'dashboard',
    'profile',
    'fees',
    'hostel',
    'library',
    'results',
  ],
};

// Check if user has access to a route
export const hasAccess = (userRole, route) => {
  if (!userRole) return false;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(route) || permissions.includes('*');
};

// Get menu items based on role
export const getMenuItems = (userRole) => {
  // Student-specific menu items
  if (userRole === ROLES.STUDENT) {
    return [
      { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { path: '/students/profile', label: 'My Profile', icon: 'Users' },
      { path: '/students/receipts', label: 'My Receipts', icon: 'DollarSign' },
      { path: '/students/hostel', label: 'My Hostel', icon: 'Home' },
      { path: '/students/library', label: 'My Library', icon: 'BookOpen' },
      { path: '/students/marks-attendance', label: 'Marks & Attendance', icon: 'GraduationCap' },
    ];
  }

  // Staff menu items
  const allMenus = [
    { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', roles: ['*'] },
    { path: '/users', label: 'User Management', icon: 'UserCog', roles: [ROLES.ADMIN] },
    { path: '/students', label: 'Students', icon: 'Users', roles: [ROLES.ADMIN, ROLES.ADMISSIONS, ROLES.ACCOUNTS, ROLES.HOSTEL_WARDEN, ROLES.LIBRARIAN, ROLES.EXAM_CELL] },
    { path: '/finance', label: 'Finance', icon: 'DollarSign', roles: [ROLES.ADMIN, ROLES.ACCOUNTS] },
    { path: '/hostel', label: 'Hostel', icon: 'Home', roles: [ROLES.ADMIN, ROLES.HOSTEL_WARDEN] },
    { path: '/library', label: 'Library', icon: 'BookOpen', roles: [ROLES.ADMIN, ROLES.LIBRARIAN] },
    { path: '/exams', label: 'Exams', icon: 'GraduationCap', roles: [ROLES.ADMIN, ROLES.EXAM_CELL] },
    { path: '/courses', label: 'Courses', icon: 'Book', roles: [ROLES.ADMIN, ROLES.ADMISSIONS, ROLES.EXAM_CELL] },
    { path: '/settings', label: 'System Settings', icon: 'Settings', roles: [ROLES.ADMIN] },
  ];

  return allMenus.filter(menu => 
    menu.roles.includes('*') || menu.roles.includes(userRole)
  );
};

