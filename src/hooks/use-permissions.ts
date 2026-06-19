import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/role-context";

export function usePermissions(moduleId: string) {
  const { user } = useAuth();
  const { getRoleById } = useRoles();

  if (!user) return { canView: false, canCreate: false, canEdit: false, canDelete: false, hasAll: false, can: () => false };

  const roleName = typeof user.role === "string" ? user.role : user.role?.name || "";
  const roleId = roleName.toLowerCase().replace(/\s+/g, "-");
  
  const roleConfig = getRoleById(roleId);
  const permissions = roleConfig?.permissions || [];

  const hasAll = permissions.includes("all");

  const canView = hasAll || permissions.includes(`${moduleId}.view`);
  const canCreate = hasAll || permissions.includes(`${moduleId}.create`);
  const canEdit = hasAll || permissions.includes(`${moduleId}.edit`);
  const canDelete = hasAll || permissions.includes(`${moduleId}.delete`);

  // General helper to check a specific action
  const can = (action: string) => hasAll || permissions.includes(`${moduleId}.${action}`);

  return { canView, canCreate, canEdit, canDelete, hasAll, can };
}
