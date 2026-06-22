"use client";

import { useState, useEffect } from "react";
import { Plus, Shield, Check, X, Edit2, Trash2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { roleService, Role } from "@/services/role.service";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ActionButtons } from "@/components/ui/ActionButtons";
import toast from "react-hot-toast";
import { usePermissions } from "@/hooks/use-permissions";

const MODULE_CONFIG = [
  { id: "projects", name: "Projects", actions: ["view", "view-details", "create", "edit", "delete", "view-office", "view-site", "view-tasks", "view-documents", "view-materials", "view-team", "view-photos", "view-finances", "view-timeline"] },
  { id: "tasks", name: "Tasks", actions: ["view", "create", "edit", "delete"] },
  { id: "office-work", name: "Office Work", actions: ["view", "create", "edit", "delete"] },
  { id: "site-work", name: "Site Work", actions: ["view", "create", "edit", "delete"] },
  { id: "office-team", name: "Office Team", actions: ["view", "create", "edit", "delete"] },
  { id: "site-team", name: "Site Team", actions: ["view", "create", "edit", "delete"] },
  { id: "clients", name: "Clients", actions: ["view", "create", "edit", "delete"] },
  { id: "site-photos", name: "Site Photos", actions: ["view", "create", "delete"] },
  { id: "attendance", name: "Attendance", actions: ["view", "create", "edit", "delete"] },
  { id: "payments", name: "Payments", actions: ["view", "create", "edit", "delete"] },
  { id: "reports", name: "Reports", actions: ["view"] },
  { id: "messages", name: "Messages", actions: ["view", "create", "delete"] },
  { id: "staff", name: "Staff", actions: ["view", "create", "edit", "delete"] },
  { id: "roles", name: "Roles", actions: ["view", "create", "edit", "delete"] },
  { id: "settings", name: "Settings", actions: ["view", "edit"] },
  { id: "working-sop", name: "Working SOP", actions: ["view", "create", "edit", "delete"] },
  { id: "calendar", name: "Calendar", actions: ["view", "create", "edit", "delete"] },
  { id: "invoices", name: "Invoices", actions: ["view", "create", "edit", "delete"] },
  { id: "workers", name: "Workers", actions: ["view", "create", "edit", "delete"] }
];

const ALL_AVAILABLE_PERMISSIONS = [
  "all",
  "dashboard.view",
  ...MODULE_CONFIG.flatMap(m => m.actions.map(a => `${m.id}.${a}`))
];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { canCreate, canEdit, canDelete } = usePermissions("roles");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[]
  });

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const data = await roleService.getAllRoles();
      setRoles(data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenModal = (role: Role | null = null) => {
    setErrors({});
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || "",
        permissions: role.permissions
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: "",
        description: "",
        permissions: []
      });
    }
    setIsModalOpen(true);
  };

  const handleTogglePermission = (perm: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Role name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingRole) {
        await roleService.updateRole(editingRole._id, formData);
        toast.success("Role updated successfully");
      } else {
        await roleService.createRole(formData);
        toast.success("Role created successfully");
      }
      fetchRoles();
      setIsModalOpen(false);
      setErrors({});
    } catch (error) {
      console.error("Error saving role:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save role");
    }
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;
    try {
      await roleService.deleteRole(roleToDelete);
      toast.success("Role deleted successfully");
      fetchRoles();
      setIsConfirmOpen(false);
      setRoleToDelete(null);
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete role");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">ROLE MANAGEMENT</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Access & Permissions</p>
        </div>

        {canCreate && (
          <Button onClick={() => handleOpenModal()} size="sm" className="rounded-xl font-bold text-xs gap-2 bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-100">
            <Plus className="w-4 h-4" /> New Role
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => (
          <Card key={role._id} className="p-4 hover:shadow-md transition-all border-slate-200 group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{role.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Permissions:</span>
                    <Badge variant="outline" className="text-[8px] font-black px-1.5 py-0 bg-slate-50 border-slate-100">
                      {role.permissions?.length || 0} Modules
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-1">
                {(canEdit || canDelete) && (
                  <ActionButtons
                    hasEdit={canEdit}
                    hasDelete={canDelete}
                    onEdit={() => handleOpenModal(role)}
                    onDelete={() => {
                      setRoleToDelete(role._id);
                      setIsConfirmOpen(true);
                    }}
                  />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Role"
        message="Are you sure you want to delete this role? This might affect users assigned to this role."
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRole ? "Edit Role" : "Create New Role"} className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Role Name</label>
              <Input
                placeholder="e.g., Project Manager"
                value={formData.name}
                onChange={e => {
                  setFormData(f => ({ ...f, name: e.target.value }));
                  if (errors.name) setErrors(prev => {
                    const { name, ...rest } = prev;
                    return rest;
                  });
                }}
                error={errors.name}
                className="h-9 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Description</label>
              <Input
                placeholder="What does this role do?"
                value={formData.description}
                onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                className="h-9 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-3 block">Permissions</label>

              <div className="space-y-6 pr-2 custom-scrollbar pb-4">
                {/* Special Permissions */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">System Access</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: "all", label: "Full System Access (Admin)" },
                      { key: "dashboard.view", label: "Dashboard Access" }
                    ].map(item => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleTogglePermission(item.key)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${formData.permissions.includes(item.key)
                            ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300"
                          }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${formData.permissions.includes(item.key) ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-300"
                          }`}>
                          {formData.permissions.includes(item.key) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-xs font-bold">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Module Permissions */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2 ml-1">
                    <Shield className="w-4 h-4 text-slate-400" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Module Permissions</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {MODULE_CONFIG.map(module => (
                      <div key={module.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 transition-colors hover:border-indigo-200">
                        <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-400" />
                          {module.name}
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-auto">
                          {module.actions.map(action => {
                            const perm = `${module.id}.${action}`;
                            const isAllSelected = formData.permissions.includes("all");
                            const isSelected = formData.permissions.includes(perm) || isAllSelected;
                            return (
                              <button
                                key={perm}
                                type="button"
                                onClick={() => handleTogglePermission(perm)}
                                disabled={isAllSelected}
                                className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${isSelected
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                                    : "bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-200"
                                  } ${isAllSelected ? "opacity-50 cursor-not-allowed" : ""}`}
                              >
                                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${isSelected ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-300"
                                  }`}>
                                  {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider">{action}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">
              {editingRole ? "Update Role" : "Create Role"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
