"use client";

import { workers as initialWorkers, WORKER_SPECIALIZATIONS } from "@/lib/dummy-data";
import { Plus, Search, Phone, LayoutGrid, List, X, MapPin, Calendar, Briefcase, HardHat, ChevronDown, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { DataTable, Column } from "@/components/ui/DataTable";
import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/role-context";

type Worker = typeof initialWorkers[0] & { assignedRole?: string };

const emptyForm = { name: "", type: "", team: "Site", specializations: [] as string[], phone: "", email: "", rate: "", address: "", experience: "" };

export default function WorkersPage() {
  const { user } = useAuth();
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [profileWorker, setProfileWorker] = useState<Worker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [specSearch, setSpecSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showSpecDropdown, setShowSpecDropdown] = useState(false);

  const { roles } = useRoles();
  const isAdmin = user?.role === "architect" || user?.role === "director";
  const canEdit = isAdmin || user?.role === "supervisor";
  const isArchitect = isAdmin;

  const columns: Column<Worker>[] = [
    {
      header: "Worker",
      render: (worker) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-sm font-medium text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all font-mono">
            {worker.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{worker.name}</p>
            <p className="text-xs text-slate-500 font-medium">{worker.experience}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Specializations",
      render: (worker) => (
        <div className="flex flex-wrap gap-1">
          {worker.specializations.map(s => (
            <span key={s} className="px-2 py-0.5 bg-indigo-50 text-[10px] font-medium text-indigo-700 rounded border border-indigo-100 uppercase tracking-wider">
              {s}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Contact",
      render: (worker) => <span className="text-sm font-medium text-slate-600 font-mono">{worker.phone}</span>,
    },
    {
      header: "Daily Rate",
      render: (worker) => <span className="text-sm font-medium text-slate-900 font-mono">{worker.rate}</span>,
    },
    {
      header: "Assigned Project",
      render: (worker) => (
        <div className="flex flex-wrap gap-1">
          {worker.assignedProjects.length === 0
            ? <span className="text-xs text-slate-400 italic">None</span>
            : worker.assignedProjects.map(p => (
              <span key={p} className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-medium rounded border border-green-100">{p}</span>
            ))}
        </div>
      ),
    },
    {
      header: "Action",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (worker) => (
        <div className="flex items-center justify-end gap-2">
          {isArchitect && (
            <select
              value={(worker as Worker).assignedRole ?? ""}
              onChange={e => setWorkers(prev => prev.map(w => w.id === worker.id ? { ...w, assignedRole: e.target.value } : w))}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
              <option value="">No Role</option>
              {roles.filter(r => r.id !== "architect" && r.id !== "client").map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          )}
          <Button variant="ghost" className="text-indigo-600 font-bold text-sm" onClick={() => setProfileWorker(worker)}>View Profile</Button>
        </div>
      ),
    },
  ];

  const filteredWorkers = workers.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleSpec = (spec: string) => {
    setForm(f => ({
      ...f,
      specializations: f.specializations.includes(spec)
        ? f.specializations.filter(s => s !== spec)
        : [...f.specializations, spec],
      type: f.specializations.includes(spec) ? f.type : (f.type || spec),
    }));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setWorkers(prev => [...prev, {
      id: String(Date.now()),
      ...form,
      team: form.team as "Office" | "Site",
      type: form.specializations[0] || form.type,
      assignedProjects: [],
      joinDate: new Date().toISOString().split("T")[0],
      email: form.email || `${form.name.toLowerCase().replace(/\s+/g, ".")}@archisite.pro`
    }]);
    setForm(emptyForm);
    setIsAddModalOpen(false);
    setShowSpecDropdown(false);
  };

  const filteredSpecs = WORKER_SPECIALIZATIONS.filter(s =>
    s.toLowerCase().includes(specSearch.toLowerCase()) && !form.specializations.includes(s)
  );

  return (
    <>
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-medium text-slate-900 tracking-tight">Worker Directory</h2>
            <p className="text-sm font-medium text-slate-500 hidden sm:block">Manage your workforce and specialized trades</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <Input placeholder="Search by name or skill..." icon={Search} className="w-64"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm h-[46px]">
              <Button variant={view === "grid" ? "white" : "ghost"} size="icon" onClick={() => setView("grid")}
                className={cn("p-2 rounded-lg", view === "grid" ? "text-indigo-600 shadow-sm" : "text-slate-400")}>
                <LayoutGrid className="w-5 h-5" />
              </Button>
              <Button variant={view === "list" ? "white" : "ghost"} size="icon" onClick={() => setView("list")}
                className={cn("p-2 rounded-lg", view === "list" ? "text-indigo-600 shadow-sm" : "text-slate-400")}>
                <List className="w-5 h-5" />
              </Button>
            </div>
            {canEdit && (
              <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 font-medium">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Register Worker</span>
              </Button>
            )}
          </div>
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredWorkers.map(worker => (
              <Card key={worker.id} className="p-6 space-y-5 group hover:border-indigo-200 transition-all">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl font-medium text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 font-mono">
                    {worker.name.split(" ").map(n => n[0]).join("")}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{worker.name}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {worker.specializations.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-indigo-50 text-[10px] font-medium text-indigo-700 rounded-lg border border-indigo-100 uppercase tracking-wider">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-slate-500">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium font-mono">{worker.phone}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-500">Daily Rate</span>
                    <span className="font-medium text-slate-900 font-mono">{worker.rate}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1 text-xs font-medium" onClick={() => setProfileWorker(worker)}>View Profile</Button>
                  {isArchitect && (
                    <select
                      value={(worker as Worker).assignedRole ?? ""}
                      onChange={e => setWorkers(prev => prev.map(w => w.id === worker.id ? { ...w, assignedRole: e.target.value } : w))}
                      className="flex-1 px-2 py-1.5 border border-slate-200 rounded-xl text-[10px] font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                      <option value="">No Role</option>
                      {roles.filter(r => r.id !== "architect" && r.id !== "client").map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden p-0">
            <DataTable columns={columns} data={filteredWorkers} />
          </Card>
        )}
      </div>

      {/* Add Worker Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setForm(emptyForm); setShowSpecDropdown(false); }} title="Register New Worker">
        <form onSubmit={handleAdd} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Full Name *</label>
              <Input placeholder="e.g., John Doe" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Phone</label>
              <Input placeholder="e.g., 555-0123" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>

          {/* Specializations */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Specializations *</label>
            {form.specializations.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {form.specializations.map(s => (
                  <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200">
                    {s}
                    <button type="button" onClick={() => toggleSpec(s)} className="hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="relative">
              <button type="button" onClick={() => setShowSpecDropdown(v => !v)}
                className="w-full flex items-center justify-between px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white hover:border-indigo-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <span className={form.specializations.length === 0 ? "text-slate-400" : "text-slate-700"}>
                  {form.specializations.length === 0 ? "Select specializations..." : `${form.specializations.length} selected`}
                </span>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showSpecDropdown && "rotate-180")} />
              </button>
              {showSpecDropdown && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-3 border-b border-slate-100">
                    <Input placeholder="Search specialization..." value={specSearch}
                      onChange={e => setSpecSearch(e.target.value)} icon={Search} />
                  </div>
                  <div className="max-h-48 overflow-y-auto p-2">
                    {filteredSpecs.map(s => (
                      <button key={s} type="button" onClick={() => toggleSpec(s)}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-all">
                        {s}
                      </button>
                    ))}
                    {filteredSpecs.length === 0 && (
                      <p className="text-center text-xs text-slate-400 py-4">No more specializations</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Daily Rate</label>
              <Input placeholder="e.g., $150/day" value={form.rate}
                onChange={e => setForm(f => ({ ...f, rate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Experience</label>
              <Input placeholder="e.g., 5 years" value={form.experience}
                onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Address</label>
            <Input placeholder="e.g., 123 Main St" value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => { setIsAddModalOpen(false); setForm(emptyForm); }}>Cancel</Button>
            <Button type="submit">Register Worker</Button>
          </div>
        </form>
      </Modal>

      {/* Profile Modal */}
      {profileWorker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 p-8 relative">
              <button onClick={() => setProfileWorker(null)}
                className="absolute top-5 right-5 w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all">
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-white/10 rounded-[1.5rem] flex items-center justify-center text-3xl font-black text-white border-2 border-white/20">
                  {profileWorker.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">{profileWorker.name}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {profileWorker.specializations.map(s => (
                      <span key={s} className="px-2.5 py-1 bg-white/20 text-white text-[10px] font-black rounded-lg border border-white/20 uppercase tracking-widest">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8 space-y-4">
              {/* Role Badge */}
              {profileWorker.assignedRole && (
                <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Role</p>
                    <p className="text-sm font-bold text-indigo-700">
                      {roles.find(r => r.id === profileWorker.assignedRole)?.name ?? profileWorker.assignedRole}
                    </p>
                  </div>
                  {isArchitect && (
                    <select
                      value={profileWorker.assignedRole ?? ""}
                      onChange={e => {
                        const val = e.target.value;
                        setWorkers(prev => prev.map(w => w.id === profileWorker.id ? { ...w, assignedRole: val } : w));
                        setProfileWorker(prev => prev ? { ...prev, assignedRole: val } : prev);
                      }}
                      className="ml-auto px-3 py-1.5 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                      <option value="">No Role</option>
                      {roles.filter(r => r.id !== "architect" && r.id !== "client").map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}
              {[
                { icon: Phone, label: "Phone", value: profileWorker.phone },
                { icon: HardHat, label: "Experience", value: profileWorker.experience },
                { icon: Briefcase, label: "Daily Rate", value: profileWorker.rate },
                { icon: Calendar, label: "Joined", value: profileWorker.joinDate },
                { icon: MapPin, label: "Address", value: profileWorker.address },
              ].map(({ icon: Icon, label, value }) => value ? (
                <div key={label} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
                    <Icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                    <p className="text-sm font-bold text-slate-900">{value}</p>
                  </div>
                </div>
              ) : null)}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Assigned Projects</p>
                {profileWorker.assignedProjects.length === 0
                  ? <p className="text-sm text-slate-400 italic">No projects assigned</p>
                  : <div className="flex flex-wrap gap-2">
                    {profileWorker.assignedProjects.map(p => (
                      <span key={p} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100">{p}</span>
                    ))}
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
