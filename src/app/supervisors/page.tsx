"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Trash2, Loader2, Mail, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";

interface Role {
  _id: string;
  roleName: string;
}

interface Supervisor {
  _id: string;
  userName: string;
  email: string;
  contact_no?: string;
  role?: Role;
  employmentType?: string;
}

const emptyForm = {
  userName: "",
  email: "",
  password: "",
  contact_no: "",
  roleId: "",
  employmentType: "MONTHLY",
};

export default function SupervisorsPage() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);

  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        fetch("http://localhost:9000/architecture/user", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:9000/architecture/role", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const usersPayload = await usersRes.json();
      const rolesPayload = await rolesRes.json();

      const allRoles: Role[] = rolesPayload.roles || [];
      setRoles(allRoles);

      // Filter only users whose role name contains "supervisor" (case-insensitive)
      const allUsers: Supervisor[] = usersPayload.users || [];
      const supervisorUsers = allUsers.filter(
        (u) => u.role?.roleName?.toLowerCase().includes("supervisor")
      );
      setSupervisors(supervisorUsers);

      // Auto-select supervisor role in form
      const supervisorRole = allRoles.find((r) => r.roleName.toLowerCase().includes("supervisor"));
      if (supervisorRole) setForm((f) => ({ ...f, roleId: supervisorRole._id }));
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("http://localhost:9000/architecture/user", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userName: form.userName,
          email: form.email,
          password: form.password,
          contact_no: form.contact_no,
          role: form.roleId,
          employmentType: form.employmentType,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || payload.message || "Failed to create supervisor");
      setIsModalOpen(false);
      const supervisorRole = roles.find((r) => r.roleName.toLowerCase().includes("supervisor"));
      setForm({ ...emptyForm, roleId: supervisorRole?._id || "" });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this supervisor?")) return;
    setDeletingId(id);
    try {
      await fetch(`http://localhost:9000/architecture/user/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSupervisors((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = supervisors.filter(
    (s) =>
      s.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Supervisors</h2>
            <p className="text-sm font-medium text-slate-500 hidden sm:block">Manage site supervisors</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <Input placeholder="Search supervisors..." icon={Search} className="w-64"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Supervisor</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No supervisors found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((s) => (
              <Card key={s._id} className="p-6 space-y-5 group hover:border-indigo-200 transition-all">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl font-bold text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                    {s.userName?.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </div>
                  <button onClick={() => handleDelete(s._id)} disabled={deletingId === s._id}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50">
                    {deletingId === s._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{s.userName}</h3>
                  {s.role && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-[10px] font-bold text-indigo-700 rounded-lg border border-indigo-100 uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" />{s.role.roleName}
                    </span>
                  )}
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-slate-500">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium truncate">{s.email}</span>
                  </div>
                  {s.contact_no && (
                    <div className="flex items-center gap-3 text-slate-500">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">{s.contact_no}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setError(""); }} title="Add New Supervisor">
        <form onSubmit={handleCreate} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold text-center">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Username *</label>
              <Input placeholder="e.g. rahul_supervisor" value={form.userName}
                onChange={(e) => setForm((f) => ({ ...f, userName: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email *</label>
              <Input type="email" placeholder="e.g. rahul@site.pro" value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Password *</label>
              <Input type="password" placeholder="Min 6 characters" value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Phone</label>
              <Input placeholder="e.g. 9876543210" value={form.contact_no}
                onChange={(e) => setForm((f) => ({ ...f, contact_no: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Role *</label>
              <select required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.roleId} onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}>
                <option value="">Select role</option>
                {roles.map((r) => (
                  <option key={r._id} value={r._id}>{r.roleName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Employment Type</label>
              <select
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.employmentType} onChange={(e) => setForm((f) => ({ ...f, employmentType: e.target.value }))}>
                <option value="DAILY">Daily Wage</option>
                <option value="MONTHLY">Monthly Salary</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => { setIsModalOpen(false); setError(""); }}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Adding...</> : "Add Supervisor"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
