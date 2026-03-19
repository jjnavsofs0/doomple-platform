/**
 * Permission types
 */
export enum Permission {
  // Dashboard
  VIEW_DASHBOARD = "view_dashboard",

  // Leads
  VIEW_LEADS = "view_leads",
  CREATE_LEAD = "create_lead",
  EDIT_LEAD = "edit_lead",
  DELETE_LEAD = "delete_lead",
  EXPORT_LEADS = "export_leads",

  // Clients
  VIEW_CLIENTS = "view_clients",
  CREATE_CLIENT = "create_client",
  EDIT_CLIENT = "edit_client",
  DELETE_CLIENT = "delete_client",

  // Projects
  VIEW_PROJECTS = "view_projects",
  CREATE_PROJECT = "create_project",
  EDIT_PROJECT = "edit_project",
  DELETE_PROJECT = "delete_project",

  // Quotations
  VIEW_QUOTATIONS = "view_quotations",
  CREATE_QUOTATION = "create_quotation",
  EDIT_QUOTATION = "edit_quotation",
  DELETE_QUOTATION = "delete_quotation",
  SEND_QUOTATION = "send_quotation",

  // Invoices
  VIEW_INVOICES = "view_invoices",
  CREATE_INVOICE = "create_invoice",
  EDIT_INVOICE = "edit_invoice",
  DELETE_INVOICE = "delete_invoice",
  SEND_INVOICE = "send_invoice",
  MARK_PAID = "mark_paid",

  // Payments
  VIEW_PAYMENTS = "view_payments",
  PROCESS_PAYMENT = "process_payment",
  REFUND_PAYMENT = "refund_payment",

  // Reports
  VIEW_REPORTS = "view_reports",
  EXPORT_REPORTS = "export_reports",

  // Team
  VIEW_TEAM = "view_team",
  MANAGE_TEAM = "manage_team",
  ASSIGN_TASKS = "assign_tasks",

  // Settings
  VIEW_SETTINGS = "view_settings",
  EDIT_SETTINGS = "edit_settings",
  MANAGE_USERS = "manage_users",
  MANAGE_ROLES = "manage_roles",
}

/**
 * User roles
 */
export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  EMPLOYEE = "employee",
  ACCOUNTANT = "accountant",
  CLIENT = "client",
}

/**
 * Role permissions mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Admin has all permissions
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_LEADS,
    Permission.CREATE_LEAD,
    Permission.EDIT_LEAD,
    Permission.DELETE_LEAD,
    Permission.EXPORT_LEADS,
    Permission.VIEW_CLIENTS,
    Permission.CREATE_CLIENT,
    Permission.EDIT_CLIENT,
    Permission.DELETE_CLIENT,
    Permission.VIEW_PROJECTS,
    Permission.CREATE_PROJECT,
    Permission.EDIT_PROJECT,
    Permission.DELETE_PROJECT,
    Permission.VIEW_QUOTATIONS,
    Permission.CREATE_QUOTATION,
    Permission.EDIT_QUOTATION,
    Permission.DELETE_QUOTATION,
    Permission.SEND_QUOTATION,
    Permission.VIEW_INVOICES,
    Permission.CREATE_INVOICE,
    Permission.EDIT_INVOICE,
    Permission.DELETE_INVOICE,
    Permission.SEND_INVOICE,
    Permission.MARK_PAID,
    Permission.VIEW_PAYMENTS,
    Permission.PROCESS_PAYMENT,
    Permission.REFUND_PAYMENT,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
    Permission.VIEW_TEAM,
    Permission.MANAGE_TEAM,
    Permission.ASSIGN_TASKS,
    Permission.VIEW_SETTINGS,
    Permission.EDIT_SETTINGS,
    Permission.MANAGE_USERS,
    Permission.MANAGE_ROLES,
  ],

  [UserRole.MANAGER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_LEADS,
    Permission.CREATE_LEAD,
    Permission.EDIT_LEAD,
    Permission.EXPORT_LEADS,
    Permission.VIEW_CLIENTS,
    Permission.CREATE_CLIENT,
    Permission.EDIT_CLIENT,
    Permission.VIEW_PROJECTS,
    Permission.CREATE_PROJECT,
    Permission.EDIT_PROJECT,
    Permission.VIEW_QUOTATIONS,
    Permission.CREATE_QUOTATION,
    Permission.EDIT_QUOTATION,
    Permission.SEND_QUOTATION,
    Permission.VIEW_INVOICES,
    Permission.VIEW_PAYMENTS,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
    Permission.VIEW_TEAM,
    Permission.ASSIGN_TASKS,
  ],

  [UserRole.EMPLOYEE]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_LEADS,
    Permission.VIEW_CLIENTS,
    Permission.VIEW_PROJECTS,
    Permission.VIEW_QUOTATIONS,
    Permission.VIEW_INVOICES,
    Permission.VIEW_TEAM,
  ],

  [UserRole.ACCOUNTANT]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_CLIENTS,
    Permission.VIEW_QUOTATIONS,
    Permission.VIEW_INVOICES,
    Permission.CREATE_INVOICE,
    Permission.EDIT_INVOICE,
    Permission.SEND_INVOICE,
    Permission.MARK_PAID,
    Permission.VIEW_PAYMENTS,
    Permission.PROCESS_PAYMENT,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
  ],

  [UserRole.CLIENT]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_INVOICES,
    Permission.VIEW_PAYMENTS,
  ],
};

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(
  userRole: UserRole | string,
  permission: Permission
): boolean {
  const role = userRole as UserRole;
  if (!role || !ROLE_PERMISSIONS[role]) {
    return false;
  }

  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Check if a user role can access a specific route
 */
export function canAccessRoute(
  userRole: UserRole | string,
  pathname: string
): boolean {
  const role = userRole as UserRole;

  // Define route patterns and required permissions
  const routePermissions: Record<string, Permission> = {
    "/admin/dashboard": Permission.VIEW_DASHBOARD,
    "/admin/leads": Permission.VIEW_LEADS,
    "/admin/clients": Permission.VIEW_CLIENTS,
    "/admin/projects": Permission.VIEW_PROJECTS,
    "/admin/quotations": Permission.VIEW_QUOTATIONS,
    "/admin/invoices": Permission.VIEW_INVOICES,
    "/admin/payments": Permission.VIEW_PAYMENTS,
    "/admin/reports": Permission.VIEW_REPORTS,
    "/admin/team": Permission.VIEW_TEAM,
    "/admin/settings": Permission.VIEW_SETTINGS,
  };

  // Check exact match
  if (routePermissions[pathname]) {
    return hasPermission(role, routePermissions[pathname]);
  }

  // Check pattern match (e.g., /admin/leads/create)
  const pattern = Object.keys(routePermissions).find((key) =>
    pathname.startsWith(key)
  );

  if (pattern) {
    return hasPermission(role, routePermissions[pattern]);
  }

  // Public routes
  if (pathname.startsWith("/") && !pathname.startsWith("/admin")) {
    return true;
  }

  return false;
}

/**
 * Get all permissions for a user role
 */
export function getPermissionsForRole(userRole: UserRole | string): Permission[] {
  const role = userRole as UserRole;
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a user role can perform multiple permissions
 */
export function hasAllPermissions(
  userRole: UserRole | string,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission));
}

/**
 * Check if a user role has any of the provided permissions
 */
export function hasAnyPermission(
  userRole: UserRole | string,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(userRole, permission));
}
