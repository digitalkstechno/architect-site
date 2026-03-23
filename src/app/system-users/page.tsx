"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Trash2, Loader2, Mail, Phone, ShieldCheck, Key, Users, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";

const BASE = "http://localhost:9000/architecture";
const token = () => (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
const authHeaders = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

const MODULES = ["USER","ROLE","PERMISSION","PROJECT","PROJECT_STAGE","PROJECT_ESTIMATION","PROJECT_UPDATE","PROJET_TASK","PAYMENT_LEDGER","BANK_BRIEF","CLIENT","WORKER","ATTENDENCE","WORKERTASK"];
const ACTIONS = ["CREATE","READ","UPDATE","DELETE"];

// ─── Types ───────────────────────────────────────────────────────────────────
interface Permission { _id: string; module: string; actions: string[]; permissionName?: string; }
interface Role { _id: string; roleName: string; permissions?: Permission[]; }
interface SystemUser { _id: string; userName: string; email: string; contact_no?: string; role?: Role; employmentType?: string; }

// ─── Tab Button ──────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-100"}`}>
      <Icon className="w-4 h-4" />{label}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// USERS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function UsersTab({ roles }: { roles: Role[] }) {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const emptyForm = { userName: "", email: "", password: "", contact_no: "", roleId: "", employmentType: "MONTHLY" };
  const [form, setForm] = useState(emptyForm);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/user`, { headers: authHeaders() });
      const d = await res.json();
      setUsers(d.users || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true); setError("");
    try {
      const res = await fetch(`${BASE}/user`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ userName: form.userName, email: form.email, password: form.password, contact_no: form.contact_no, role: form.roleId, employmentType: form.employmentType }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || d.message || "Failed");
      setIsModalOpen(false); setForm(emptyForm); fetchUsers();
    } catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    setDeletingId(id);
    await fetch(`${BASE}/user/${id}`, { method: "DELETE", headers: authHeaders() });
    setUsers(p => p.filter(u => u._id !== id));
    setDeletingId(null);
  };

  const filtered = users.filter(u => u.userName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Input placeholder="Search users..." icon={Search} className="w-64" value={search} onChange={e => setSearch(e.target.value)} />
        <Button onClick={() => setIsModalOpen(true)} className="gap-2"><Plus className="w-4 h-4" />Add User</Button>
      </div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>
        : filtered.length === 0 ? <div className="text-center py-20 text-slate-400 font-bold text-xs uppercase tracking-widest">No users found</div>
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(u => (
              <Card key={u._id} className="p-5 space-y-4 group hover:border-indigo-200 transition-all">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-lg font-bold text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                    {u.userName?.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </div>
                  <button onClick={() => handleDelete(u._id)} disabled={deletingId === u._id}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    {deletingId === u._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{u.userName}</h3>
                  {u.role && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-indigo-50 text-[10px] font-bold text-indigo-700 rounded-lg border border-indigo-100 uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" />{u.role.roleName}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-slate-500"><Mail className="w-3.5 h-3.5 text-slate-400" /><span className="text-xs font-medium truncate">{u.email}</span></div>
                  {u.contact_no && <div className="flex items-center gap-2 text-slate-500"><Phone className="w-3.5 h-3.5 text-slate-400" /><span className="text-xs font-medium">{u.contact_no}</span></div>}
                </div>
              </Card>
            ))}
          </div>
        )}

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setForm(emptyForm); setError(""); }} title="Add New User">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold text-center">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Username *</label><Input placeholder="e.g. rahul_arch" value={form.userName} onChange={e => setForm(f => ({ ...f, userName: e.target.value }))} required /></div>
            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Email *</label><Input type="email" placeholder="rahul@site.pro" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Password *</label><Input type="password" placeholder="Min 6 chars" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required /></div>
            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Phone</label><Input placeholder="9876543210" value={form.contact_no} onChange={e => setForm(f => ({ ...f, contact_no: e.target.value }))} /></div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Role *</label>
              <select required className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.roleId} onChange={e => setForm(f => ({ ...f, roleId: e.target.value }))}>
                <option value="">Select role</option>
                {roles.map(r => <option key={r._id} value={r._id}>{r.roleName}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Employment Type</label>
              <select className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.employmentType} onChange={e => setForm(f => ({ ...f, employmentType: e.target.value }))}>
                <option value="DAILY">Daily Wage</option>
                <option value="MONTHLY">Monthly Salary</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => { setIsModalOpen(false); setForm(emptyForm); setError(""); }}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : "Create User"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROLES TAB
// ═══════════════════════════════════════════════════════════════════════════════
function RolesTab({ roles, permissions, onRolesChange }: { roles: Role[]; permissions: Permission[]; onRolesChange: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [error, setError] = useState("");
  const [roleName, setRoleName] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const openCreate = () => { setEditRole(null); setRoleName(""); setSelectedPerms([]); setError(""); setIsModalOpen(true); };
  const openEdit = (r: Role) => {
    setEditRole(r);
    setRoleName(r.roleName);
    setSelectedPerms((r.permissions || []).map(p => p._id));
    setError("");
    setIsModalOpen(true);
  };

  const togglePerm = (id: string) => setSelectedPerms(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true); setError("");
    try {
      const url = editRole ? `${BASE}/role/${editRole._id}` : `${BASE}/role`;
      const method = editRole ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: authHeaders(),
        body: JSON.stringify({ roleName, permissions: selectedPerms }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || d.message || "Failed");
      setIsModalOpen(false); onRolesChange();
    } catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this role?")) return;
    setDeletingId(id);
    await fetch(`${BASE}/role/${id}`, { method: "DELETE", headers: authHeaders() });
    onRolesChange();
    setDeletingId(null);
  };

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" />Create Role</Button>
      </div>

      {roles.length === 0 ? <div className="text-center py-20 text-slate-400 font-bold text-xs uppercase tracking-widest">No roles found</div>
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {roles.map(r => (
              <Card key={r._id} className="p-5 space-y-4 group hover:border-indigo-200 transition-all">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-600 transition-all duration-500">
                    <Key className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors duration-500" />
                  </div>
                  <button onClick={() => handleDelete(r._id)} disabled={deletingId === r._id}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    {deletingId === r._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{r.roleName}</h3>
                  <p className="text-xs text-slate-400 mt-1">{(r.permissions || []).length} permissions assigned</p>
                </div>
                <Button variant="secondary" className="w-full text-xs" onClick={() => openEdit(r)}>Manage Permissions</Button>
              </Card>
            ))}
          </div>
        )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editRole ? `Edit Role: ${editRole.roleName}` : "Create New Role"}>
        <form onSubmit={handleSave} className="space-y-5">
          {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold text-center">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Role Name *</label>
            <Input placeholder="e.g. Architect, Supervisor" value={roleName} onChange={e => setRoleName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Assign Permissions</label>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {permissions.map(p => (
                <label key={p._id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedPerms.includes(p._id) ? "bg-indigo-50 border-indigo-200" : "bg-slate-50 border-slate-100 hover:border-slate-200"}`}>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{p.module}</p>
                    <p className="text-[10px] text-slate-400">{p.actions.join(", ")}</p>
                  </div>
                  <input type="checkbox" checked={selectedPerms.includes(p._id)} onChange={() => togglePerm(p._id)}
                    className="w-4 h-4 accent-indigo-600" />
                </label>
              ))}
              {permissions.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No permissions available. Create some first.</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : editRole ? "Update Role" : "Create Role"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERMISSIONS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function PermissionsTab({ permissions, onPermissionsChange }: { permissions: Permission[]; onPermissionsChange: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ module: "", actions: [] as string[], permissionName: "" });

  const toggleAction = (a: string) => setForm(f => ({ ...f, actions: f.actions.includes(a) ? f.actions.filter(x => x !== a) : [...f.actions, a] }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true); setError("");
    try {
      const res = await fetch(`${BASE}/permission`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ module: form.module, actions: form.actions, permissionName: form.permissionName || form.module }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || d.message || "Failed");
      setIsModalOpen(false); setForm({ module: "", actions: [], permissionName: "" }); onPermissionsChange();
    } catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this permission?")) return;
    setDeletingId(id);
    await fetch(`${BASE}/permission/${id}`, { method: "DELETE", headers: authHeaders() });
    onPermissionsChange();
    setDeletingId(null);
  };

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button onClick={() => { setForm({ module: "", actions: [], permissionName: "" }); setError(""); setIsModalOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" />Create Permission
        </Button>
      </div>

      {permissions.length === 0 ? <div className="text-center py-20 text-slate-400 font-bold text-xs uppercase tracking-widest">No permissions found</div>
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {permissions.map(p => (
              <Card key={p._id} className="p-5 space-y-3 group hover:border-indigo-200 transition-all">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-indigo-600 transition-all duration-500">
                    <Lock className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors duration-500" />
                  </div>
                  <button onClick={() => handleDelete(p._id)} disabled={deletingId === p._id}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    {deletingId === p._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{p.module}</h3>
                  {p.permissionName && p.permissionName !== p.module && <p className="text-xs text-slate-400">{p.permissionName}</p>}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {p.actions.map(a => (
                    <span key={a} className="px-2 py-0.5 bg-indigo-50 text-[10px] font-bold text-indigo-700 rounded border border-indigo-100 uppercase">{a}</span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Permission">
        <form onSubmit={handleCreate} className="space-y-5">
          {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold text-center">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Module *</label>
            <select required className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.module} onChange={e => setForm(f => ({ ...f, module: e.target.value }))}>
              <option value="">Select module</option>
              {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Permission Name (optional)</label>
            <Input placeholder="e.g. Supervisor Project Access" value={form.permissionName} onChange={e => setForm(f => ({ ...f, permissionName: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Actions *</label>
            <div className="grid grid-cols-2 gap-2">
              {ACTIONS.map(a => (
                <label key={a} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.actions.includes(a) ? "bg-indigo-50 border-indigo-200" : "bg-slate-50 border-slate-100"}`}>
                  <input type="checkbox" checked={form.actions.includes(a)} onChange={() => toggleAction(a)} className="w-4 h-4 accent-indigo-600" />
                  <span className="text-xs font-bold text-slate-700">{a}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting || form.actions.length === 0}>
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : "Create Permission"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function SystemUsersPage() {
  const [tab, setTab] = useState<"users" | "roles" | "permissions">("users");
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const fetchRoles = useCallback(async () => {
    const res = await fetch(`${BASE}/role`, { headers: authHeaders() });
    const d = await res.json();
    setRoles(d.roles || []);
  }, []);

  const fetchPermissions = useCallback(async () => {
    const res = await fetch(`${BASE}/permission`, { headers: authHeaders() });
    const d = await res.json();
    setPermissions(d.permissions || []);
  }, []);

  useEffect(() => { fetchRoles(); fetchPermissions(); }, [fetchRoles, fetchPermissions]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Management</h2>
        <p className="text-sm font-medium text-slate-500">Manage users, roles and permissions</p>
      </div>

      <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl w-fit shadow-sm">
        <TabBtn active={tab === "users"} onClick={() => setTab("users")} icon={Users} label="Users" />
        <TabBtn active={tab === "roles"} onClick={() => setTab("roles")} icon={Key} label="Roles" />
        <TabBtn active={tab === "permissions"} onClick={() => setTab("permissions")} icon={Lock} label="Permissions" />
      </div>

      <div>
        {tab === "users" && <UsersTab roles={roles} />}
        {tab === "roles" && <RolesTab roles={roles} permissions={permissions} onRolesChange={fetchRoles} />}
        {tab === "permissions" && <PermissionsTab permissions={permissions} onPermissionsChange={fetchPermissions} />}
      </div>
    </div>
  );
}
