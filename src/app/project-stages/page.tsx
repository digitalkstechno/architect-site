"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Trash2, Loader2, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { useProjects } from "@/lib/projects-store";
import { useAuth } from "@/lib/auth-context";

interface ProjectStage {
  _id: string;
  stageName: string;
  order: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  projectId: { _id: string; projectName: string } | null;
}

const emptyForm = { stageName: "", order: "", status: "PENDING" as const, projectId: "" };

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-green-50 text-green-700 border-green-100",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700 border-indigo-100",
  PENDING: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function ProjectStagesPage() {
  const { user } = useAuth();
  const { projects } = useProjects();
  const [stages, setStages] = useState<ProjectStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [form, setForm] = useState(emptyForm);

  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const canEdit = user?.role === "architect" ||
    (typeof user?.role === "object" && (
      (user.role as any).roleName?.toLowerCase().includes("architect") ||
      (user.role as any).roleName === "TENANT_ADMIN"
    ));

  const fetchStages = useCallback(async () => {
    try {
      setLoading(true);
      const url = filterProject
        ? `http://localhost:9000/architecture/projectstage?projectId=${filterProject}`
        : "http://localhost:9000/architecture/projectstage";
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setStages(data.projectstage || data.data || []);
    } catch (err) {
      console.error("Fetch stages error:", err);
    } finally {
      setLoading(false);
    }
  }, [token, filterProject]);

  useEffect(() => { fetchStages(); }, [fetchStages]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:9000/architecture/projectstage", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          projectId: form.projectId,
          stageName: form.stageName,
          order: Number(form.order) || stages.length + 1,
          status: form.status,
        }),
      });
      if (!res.ok) throw new Error("Failed to create stage");
      setIsModalOpen(false);
      setForm(emptyForm);
      fetchStages();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    setStages((prev) => prev.map((s) => s._id === id ? { ...s, status: status as any } : s));
    await fetch(`http://localhost:9000/architecture/projectstage/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this stage?")) return;
    setDeletingId(id);
    try {
      await fetch(`http://localhost:9000/architecture/projectstage/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setStages((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = stages.filter(
    (s) =>
      s.stageName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.projectId?.projectName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const counts = {
    total: stages.length,
    completed: stages.filter((s) => s.status === "COMPLETED").length,
    inProgress: stages.filter((s) => s.status === "IN_PROGRESS").length,
    pending: stages.filter((s) => s.status === "PENDING").length,
  };

  return (
    <>
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Project Stages</h2>
            <p className="text-sm font-medium text-slate-500 hidden sm:block">Track construction stages across all projects</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <Input placeholder="Search stages..." icon={Search} className="w-56"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <select
              className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 hidden md:block"
              value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
              <option value="">All Projects</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {canEdit && (
              <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Stage</span>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: counts.total, color: "bg-slate-50 border-slate-200 text-slate-900" },
            { label: "Completed", value: counts.completed, color: "bg-green-50 border-green-200 text-green-700" },
            { label: "In Progress", value: counts.inProgress, color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
            { label: "Pending", value: counts.pending, color: "bg-orange-50 border-orange-200 text-orange-700" },
          ].map((s) => (
            <Card key={s.label} className={cn("p-5 border", s.color)}>
              <p className="text-xs font-bold uppercase tracking-widest opacity-60">{s.label}</p>
              <p className="text-3xl font-black mt-1">{s.value}</p>
            </Card>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <Layers className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No stages found</p>
          </div>
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Stage</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Project</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Order</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    {canEdit && <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((s) => (
                    <tr key={s._id} className="group hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-5">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{s.stageName}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-medium text-slate-600">{s.projectId?.projectName || "—"}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-medium text-slate-500">{s.order ?? "—"}</span>
                      </td>
                      <td className="px-8 py-5">
                        {canEdit ? (
                          <select value={s.status} onChange={(e) => handleUpdateStatus(s._id, e.target.value)}
                            className={cn(
                              "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500",
                              STATUS_STYLES[s.status]
                            )}>
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                        ) : (
                          <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border", STATUS_STYLES[s.status])}>
                            {s.status}
                          </span>
                        )}
                      </td>
                      {canEdit && (
                        <td className="px-8 py-5 text-right">
                          <button onClick={() => handleDelete(s._id)} disabled={deletingId === s._id}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50">
                            {deletingId === s._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setForm(emptyForm); }} title="Add Project Stage">
        <form onSubmit={handleCreate} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Project *</label>
            <select required
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={form.projectId} onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}>
              <option value="">Select project</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Stage Name *</label>
              <Input placeholder="e.g. Foundation, Roofing" value={form.stageName}
                onChange={(e) => setForm((f) => ({ ...f, stageName: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Order</label>
              <Input type="number" placeholder={String(stages.length + 1)} value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Status</label>
            <select
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => { setIsModalOpen(false); setForm(emptyForm); }}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Adding...</> : "Add Stage"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
