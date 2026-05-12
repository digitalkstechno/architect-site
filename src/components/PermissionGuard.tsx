"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { hasPermission, canCreate, canRead, canUpdate, canDelete } from "@/lib/permissions";
import type { PermissionAction } from "@/lib/permissions";

interface PermissionGuardProps {
  module: string;
  action?: PermissionAction;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Conditionally render children if user has permission
 * 
 * @example
 * <PermissionGuard module="WORKER" action="CREATE">
 *   <Button>Add Worker</Button>
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  module,
  action = "READ",
  fallback,
  children,
}) => {
  const { user } = useAuth();
  
  const roleData = typeof user?.role === "object" ? user.role : null;
  const allowed = hasPermission(roleData, module, action);

  return <>{allowed ? children : fallback}</>;
};

interface PermissionCheckProps {
  module: string;
  action?: PermissionAction;
}

/**
 * Hook to check permissions programmatically
 * 
 * @example
 * const canAddWorker = usePermissionCheck("WORKER", "CREATE");
 * if (!canAddWorker) return <div>No permission</div>;
 */
export const usePermissionCheck = ({ module, action = "READ" }: PermissionCheckProps): boolean => {
  const { user } = useAuth();
  const roleData = typeof user?.role === "object" ? user.role : null;
  return hasPermission(roleData, module, action);
};

/**
 * Convenience hook for specific actions
 */
export const useCanCreate = (module: string): boolean => {
  const { user } = useAuth();
  const roleData = typeof user?.role === "object" ? user.role : null;
  return canCreate(roleData, module);
};

export const useCanRead = (module: string): boolean => {
  const { user } = useAuth();
  const roleData = typeof user?.role === "object" ? user.role : null;
  return canRead(roleData, module);
};

export const useCanUpdate = (module: string): boolean => {
  const { user } = useAuth();
  const roleData = typeof user?.role === "object" ? user.role : null;
  return canUpdate(roleData, module);
};

export const useCanDelete = (module: string): boolean => {
  const { user } = useAuth();
  const roleData = typeof user?.role === "object" ? user.role : null;
  return canDelete(roleData, module);
};

interface PermissionRequiredProps extends Omit<PermissionCheckProps, "action"> {
  action?: PermissionAction;
  children?: React.ReactNode | ((allowed: boolean) => React.ReactNode);
}

/**
 * Render boolean or node based on permission
 * 
 * @example
 * <PermissionRequired module="WORKER" action="DELETE">
 *   {canDelete => canDelete ? <DeleteButton /> : <LockIcon />}
 * </PermissionRequired>
 */
export const PermissionRequired: React.FC<PermissionRequiredProps> = ({
  module,
  action = "READ",
  children,
}) => {
  const { user } = useAuth();
  const roleData = typeof user?.role === "object" ? user.role : null;
  const allowed = hasPermission(roleData, module, action);

  if (typeof children === "function") {
    return <>{children(allowed)}</>;
  }

  return allowed ? <>{children}</> : null;
};
