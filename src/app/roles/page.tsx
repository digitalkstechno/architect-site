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
import toast from "react-hot-toast";

const MODULES = [
  "projects", "tasks", "office-work", "site-work", "office-team", "site-team",
  "clients", "site-photos", "attendance", "payments", "reports", "messages",
  "staff", "roles", "settings", "working-sop", "calendar"
];

const ALL_AVAILABLE_PERMISSIONS = [
  "all",
  "dashboard.view",
  ...MODULES.flatMap(m => [`${m}.view`, `${m}.create`, `${m}.edit`, `${m}.delete`])
];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">ROLES & PERMISSIONS</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Access Control Management</p>
        </div>

        <Button onClick={() => handleOpenModal()} size="sm" className="rounded-xl font-bold text-xs gap-2 bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-100">
          <Plus className="w-4 h-4" /> New Role
        </Button>
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
                <button onClick={() => handleOpenModal(role)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => {
                  setRoleToDelete(role._id);
                  setIsConfirmOpen(true);
                }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRole ? "Edit Role" : "Create New Role"}>
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
              <label className="text-xs font-bold text-slate-700 mb-2 block">Permissions</label>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {/* Special Permissions */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">System Access</p>
                  <div className="grid grid-cols-2 gap-2">
                    {["all", "dashboard.view"].map(perm => (
                      <button
                        key={perm}
                        type="button"
                        onClick={() => handleTogglePermission(perm)}
                        className={`flex items-center gap-2 p-2 rounded-md border text-left transition-all ${formData.permissions.includes(perm)
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:border-indigo-100"
                          }`}
                      >
                        {formData.permissions.includes(perm) ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-200" />
                        )}
                        <span className="text-[10px] font-bold capitalize">{perm.replace('.', ' ')}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Module Permissions */}
                {MODULES.map(module => (
                  <div key={module} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">{module.replace('-', ' ')} Module</p>
                    <div className="grid grid-cols-2 gap-2">
                      {["view", "create", "edit", "delete"].map(action => {
                        const perm = `${module}.${action}`;
                        const isSelected = formData.permissions.includes(perm) || formData.permissions.includes("all");
                        return (
                          <button
                            key={perm}
                            type="button"
                            onClick={() => handleTogglePermission(perm)}
                            disabled={formData.permissions.includes("all")}
                            className={`flex items-center gap-2 p-2 rounded-md border text-left transition-all ${isSelected
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                                : "bg-white border-slate-100 text-slate-500 hover:border-indigo-100"
                              } ${formData.permissions.includes("all") ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {isSelected ? (
                              <Check className="w-3 h-3 text-indigo-600" />
                            ) : (
                              <div className="w-3 h-3 rounded-full border border-slate-200" />
                            )}
                            <span className="text-[10px] font-medium capitalize">{action}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
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
