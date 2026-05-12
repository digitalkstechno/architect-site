"use client";

import { useAuth } from "@/lib/auth-context";
import { PermissionGuard, useCanCreate, useCanDelete } from "@/components/PermissionGuard";
import { Button } from "@/components/ui/Button";
import { Trash2, Plus } from "lucide-react";

/**
 * Example: Permission-based button visibility and state
 * 
 * This shows how to use the permission system in your components
 */
export default function PermissionExample() {
  const { user } = useAuth();
  
  // Example 1: Hook-based permission check
  const canCreateWorker = useCanCreate("WORKER");
  const canDeleteWorker = useCanDelete("WORKER");
  
  // Example 2: Get all permissions for debug
  const userRole = typeof user?.role === "object" ? user.role : null;
  
  return (
    <div className="space-y-6 p-6">
      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-4">📋 Your Permissions</h3>
        
        {userRole?.permissions && userRole.permissions.length > 0 ? (
          <div className="space-y-3">
            {userRole.permissions.map((perm: any) => (
              <div key={perm._id || perm.module} className="bg-white p-3 rounded-lg border">
                <p className="font-semibold text-slate-900">{perm.module}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {perm.actions.map((action: string) => (
                    <span
                      key={action}
                      className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded"
                    >
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No permissions assigned</p>
        )}
      </div>

      <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-lg">🔐 Permission-Based Buttons</h3>
        
        {/* Example: Using hook for permission check */}
        <div>
          <p className="text-sm font-bold text-slate-700 mb-2">Can Create Worker: {canCreateWorker ? "✅ Yes" : "❌ No"}</p>
          <PermissionGuard module="WORKER" action="CREATE">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Worker
            </Button>
          </PermissionGuard>
        </div>

        {/* Example: Using PermissionGuard component */}
        <div>
          <p className="text-sm font-bold text-slate-700 mb-2">Can Delete Worker: {canDeleteWorker ? "✅ Yes" : "❌ No"}</p>
          <PermissionGuard module="WORKER" action="DELETE" fallback={<span className="text-xs text-slate-400">No delete permission</span>}>
            <Button variant="danger" className="gap-2">
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </Button>
          </PermissionGuard>
        </div>

        {/* Example: Conditional button disable */}
        <div>
          <p className="text-sm font-bold text-slate-700 mb-2">Update Permission State</p>
          <Button disabled={!useCanCreate("WORKER")} className="gap-2">
            <Plus className="w-4 h-4" />
            Update Worker (disabled if no permission)
          </Button>
        </div>
      </div>

      {/* Tips section */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
        <h4 className="font-bold text-blue-900 mb-3">💡 How to Use Permissions in Your Components:</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✓ <code className="bg-blue-100 px-2 py-1 rounded">{"<PermissionGuard module='WORKER' action='CREATE'>"}</code> - Show component if has permission</li>
          <li>✓ <code className="bg-blue-100 px-2 py-1 rounded">{"useCanCreate('WORKER')"}</code> - Check permission in hook</li>
          <li>✓ <code className="bg-blue-100 px-2 py-1 rounded">{"useCanDelete('WORKER')"}</code> - Check delete permission</li>
          <li>✓ <code className="bg-blue-100 px-2 py-1 rounded">{"usePermissionCheck({ module: 'TASK', action: 'UPDATE' })"}</code> - Custom permission check</li>
        </ul>
      </div>
    </div>
  );
}
