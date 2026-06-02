"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Shield, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DataTable, Column } from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import { staffService, StaffMember } from "@/services/staff.service";
import { roleService, Role } from "@/services/role.service";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import toast from "react-hot-toast";

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "",
    team: "Office",
    experience: "" as string | number,
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [staffData, rolesData] = await Promise.all([
        staffService.getAllStaff(),
        roleService.getAllRoles(),
      ]);
      setStaff(staffData);
      setRoles(rolesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (member: StaffMember | null = null) => {
    setErrors({});
    if (member) {
      setEditingStaff(member);
      setFormData({
        name: member.name,
        email: member.email,
        password: "",
        phone: member.phone || "",
        role: member.role?._id || "",
        team: member.team || "Office",
        experience: member.experience ?? "",
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "",
        team: "Office",
        experience: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!editingStaff && !formData.password) newErrors.password = "Password is required";
    if (!formData.role) newErrors.role = "Role is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const payload: any = {
        ...formData,
        experience: formData.experience !== "" ? Number(formData.experience) : undefined,
      };
      if (editingStaff && !payload.password) {
        delete payload.password;
      }

      if (editingStaff) {
        await staffService.updateStaff(editingStaff._id, payload);
        toast.success("Staff member updated successfully");
      } else {
        await staffService.createStaff(payload);
        toast.success("Staff member created successfully");
      }

      fetchData();
      setIsModalOpen(false);
      setErrors({});
    } catch (error: any) {
      console.error("Error saving staff:", error);
      toast.error(error.message || "Failed to save staff member");
    }
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;
    try {
      await staffService.deleteStaff(memberToDelete);
      toast.success("Staff member deleted successfully");
      fetchData();
      setIsConfirmOpen(false);
      setMemberToDelete(null);
    } catch (error: any) {
      console.error("Error deleting staff:", error);
      toast.error(error.message || "Failed to delete staff member");
    }
  };

  const columns: Column<StaffMember>[] = [
    {
      header: "Member",
      render: (member) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">
            {member.name[0]}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900">{member.name}</p>
            <p className="text-[10px] text-slate-500">{member.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      render: (member) => (
        <Badge variant="outline" className="text-[9px] font-bold uppercase bg-indigo-50 text-indigo-600 border-indigo-100 px-1.5 py-0">
          <Shield className="w-3 h-3 mr-1" />
          {member.role?.name || "No Role"}
        </Badge>
      ),
    },
    {
      header: "Team",
      render: (member) => (
        <Badge
          variant="secondary"
          className={`text-[9px] font-bold uppercase px-1.5 py-0 ${
            member.team === "Site"
              ? "bg-amber-50 text-amber-700 border-amber-100"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {member.team}
        </Badge>
      ),
    },
    {
      header: "Experience",
      render: (member) => (
        <div className="flex items-center gap-1">
          <Briefcase className="w-3 h-3 text-slate-400" />
          <span className="text-[11px] font-semibold text-slate-700 font-mono">
            {member.experience != null ? `${member.experience} yrs` : "—"}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (member) => (
        <div className="flex items-center gap-1.5">
          <div className={`w-1 h-1 rounded-full ${member.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
          <span className="text-[11px] font-medium text-slate-600">{member.isActive ? "Active" : "Inactive"}</span>
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (member) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => handleOpenModal(member)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => {
            setMemberToDelete(member._id);
            setIsConfirmOpen(true);
          }} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const filteredStaff = staff.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full p-4 sm:p-6">
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">STAFF MANAGEMENT</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Office & Site Team</p>
        </div>
        
        <Button onClick={() => handleOpenModal()} size="sm" className="rounded-xl font-bold text-xs gap-2 bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-100">
          <Plus className="w-4 h-4" /> Add Member
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search staff..." 
            className="pl-9 h-9 text-xs border-none bg-transparent focus:ring-0 shadow-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">{filteredStaff.length} Members</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={filteredStaff} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStaff ? "Edit Staff Member" : "Add New Staff Member"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">Full Name *</label>
              <Input 
                placeholder="e.g., John Doe" 
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
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">Email Address *</label>
              <Input 
                type="email" 
                placeholder="e.g., john@example.com" 
                value={formData.email}
                onChange={e => {
                  setFormData(f => ({ ...f, email: e.target.value }));
                  if (errors.email) setErrors(prev => {
                    const { email, ...rest } = prev;
                    return rest;
                  });
                }} 
                error={errors.email}
                className="h-9 text-xs" 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">Password {editingStaff && "(leave blank to keep current)"}</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={e => {
                  setFormData(f => ({ ...f, password: e.target.value }));
                  if (errors.password) setErrors(prev => {
                    const { password, ...rest } = prev;
                    return rest;
                  });
                }} 
                error={errors.password}
                className="h-9 text-xs" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">Phone Number</label>
              <Input placeholder="e.g., +1 234 567 890" value={formData.phone}
                onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} className="h-9 text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Select
                label="Role *"
                options={roles.map(role => ({ value: role._id, label: role.name }))}
                value={formData.role}
                onChange={val => {
                  setFormData(f => ({ ...f, role: val }));
                  if (errors.role) setErrors(prev => {
                    const { role, ...rest } = prev;
                    return rest;
                  });
                }}
                placeholder="Select Role"
                error={errors.role}
              />
            </div>
            <div className="space-y-1">
              <Select
                label="Team *"
                options={[
                  { value: "Office", label: "Office" },
                  { value: "Site", label: "Site" },
                ]}
                value={formData.team}
                onChange={val => setFormData(f => ({ ...f, team: val }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">Experience (Years)</label>
              <Input type="number" placeholder="e.g., 5" value={formData.experience}
                onChange={e => setFormData(f => ({ ...f, experience: e.target.value }))} className="h-9 text-xs" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button size="sm" variant="secondary" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
            <Button size="sm" type="submit">Save Member</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Staff Member"
        message="Are you sure you want to delete this staff member? This will permanently remove their account and access."
      />
    </div>
  );
}
