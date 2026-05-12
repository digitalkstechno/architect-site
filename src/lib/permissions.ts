/**
 * Permission checking utilities for role-based access control
 */

export type PermissionAction = "CREATE" | "READ" | "UPDATE" | "DELETE" | "SOFT_DELETE";

export interface Permission {
  _id?: string;
  module: string;
  actions: string[];
  permissionName?: string;
  tenantId?: string;
}

export interface RoleWithPermissions {
  roleName: string;
  _id: string;
  permissions?: Permission[];
  tenantId?: string;
}

/**
 * Check if user has permission for a specific module and action
 */
export const hasPermission = (
  role: RoleWithPermissions | null | undefined,
  module: string,
  action: PermissionAction = "READ"
): boolean => {
  if (!role || !role.permissions || !Array.isArray(role.permissions)) {
    return false;
  }

  const normalizeString = (s: string) => (s || "").toString().trim().toUpperCase();
  const normalizedModule = normalizeString(module);
  const normalizedAction = normalizeString(action);

  return role.permissions.some((perm) => {
    if (!perm || !perm.module) return false;
    
    const permModule = normalizeString(perm.module);
    if (permModule !== normalizedModule) return false;
    if (!Array.isArray(perm.actions)) return false;
    
    return perm.actions.some((act) => normalizeString(act) === normalizedAction);
  });
};

/**
 * Get all allowed actions for a module
 */
export const getAllowedActions = (
  role: RoleWithPermissions | null | undefined,
  module: string
): string[] => {
  if (!role || !role.permissions) return [];

  const normalizeString = (s: string) => (s || "").toString().trim().toUpperCase();
  const normalizedModule = normalizeString(module);

  const perm = role.permissions.find(
    (p) => normalizeString(p.module) === normalizedModule
  );

  return perm?.actions || [];
};

/**
 * Get all modules user has access to
 */

export const getAllowedModules = (
  role: RoleWithPermissions | null | undefined
): string[] => {
  if (!role || !role.permissions) return [];
  return role.permissions.map((p) => p.module).filter(Boolean);
};

/**
 * Check if user can perform CREATE action
 */
export const canCreate = (
  role: RoleWithPermissions | null | undefined,
  module: string
): boolean => hasPermission(role, module, "CREATE");

/**
 * Check if user can perform READ action
 */
export const canRead = (
  role: RoleWithPermissions | null | undefined,
  module: string
): boolean => hasPermission(role, module, "READ");

/**
 * Check if user can perform UPDATE action
 */
export const canUpdate = (
  role: RoleWithPermissions | null | undefined,
  module: string
): boolean => hasPermission(role, module, "UPDATE");

/**
 * Check if user can perform DELETE action
 */
export const canDelete = (
  role: RoleWithPermissions | null | undefined,
  module: string
): boolean => hasPermission(role, module, "DELETE");
