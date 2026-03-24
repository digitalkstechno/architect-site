"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Trash2, Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { useProjects } from "@/lib/projects-store";
import { useAuth } from "@/lib/auth-context";
import { API_BASE_URL } from "@/lib/api-config";

interface Quotation {
  _id: string;
  clientId: { _id: string; clientName: string } | null;
  projectId: { _id: string; projectName: string } | null;
  totalAmount: number;
  description: string;
  status: "DRAFT" | "SENT" | "APPROVED" | "REJECTED";
}

const emptyForm = {
  projectId: "",
  clientId: "",
  totalAmount: "",
  description: "",
  status: "DRAFT" as const,
};

const STATUS_STYLES: Record<string, string> = {
  APPROVED: "bg-green-50 text-green-700 border-green-100",
  SENT: "bg-blue-50 text-blue-700 border-blue-100",
  DRAFT: "bg-slate-100 text-slate-500 border-slate-200",
  REJECTED: "bg-red-50 text-red-700 border-red-100",
};

export default function QuotationsPage() {
  const { user } = useAuth();
  const { projects } = useProjects();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);

  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const canEdit = user?.role === "architect" ||
    (typeof user?.role === "object" && (
      (user.role as any).roleName?.toLowerCase().includes("architect") ||
      (user.role as any).roleName === "TENANT_ADMIN"
    ));

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [quotRes, clientRes] = await Promise.all([
        fetch(`${API_BASE_URL}/estimation`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/client`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const quotData = await quotRes.json();
      const clientData = await clientRes.json();
      setQuotations(quotData.projectestimations || quotData.data || []);
      setClients(clientData.clients || clientData.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleProjectChange = (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    setForm((f) => ({ ...f, projectId, clientId: proj?.clientId || "" }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/estimation`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          projectId: form.projectId,
          clientId: form.clientId,
          totalAmount: Number(form.totalAmount),
          description: form.description,
          status: form.status,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || payload.message || "Failed to create quotation");
      setIsModalOpen(false);
      setForm(emptyForm);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    setQuotations((prev) => prev.map((q) => q._id === id ? { ...q, status: status as any } : q));
    await fetch(`${API_BASE_URL}/estimation/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this quotation?")) return;
    setDeletingId(id);
    try {
      await fetch(`${API_BASE_URL}/estimation/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuotations((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = quotations.filter(
    (q) =>
      q.projectId?.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.clientId?.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalValue = quotations.reduce((sum, q) => sum + (q.totalAmount || 0), 0);
  const approvedValue = quotations
    .filter((q) => q.status === "APPROVED")
    .reduce((sum, q) => sum + (q.totalAmount || 0), 0);

  return (
    <>
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Quotations</h2>
            <p className="text-sm font-medium text-slate-500 hidden sm:block">Manage project estimates and client quotations</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <Input placeholder="Search quotations..." icon={Search} className="w-64"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            {canEdit && (
              <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">New Quotation</span>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: quotations.length, sub: null, color: "bg-slate-50 border-slate-200 text-slate-900" },
            { label: "Approved", value: quotations.filter((q) => q.status === "APPROVED").length, sub: `₹${approvedValue.toLocaleString()}`, color: "bg-green-50 border-green-200 text-green-700" },
            { label: "Sent", value: quotations.filter((q) => q.status === "SENT").length, sub: null, color: "bg-blue-50 border-blue-200 text-blue-700" },
            { label: "Draft", value: quotations.filter((q) => q.status === "DRAFT").length, sub: null, color: "bg-orange-50 border-orange-200 text-orange-700" },
          ].map((s) => (
            <Card key={s.label} className={cn("p-5 border", s.color)}>
              <p className="text-xs font-bold uppercase tracking-widest opacity-60">{s.label}</p>
              <p className="text-3xl font-black mt-1">{s.value}</p>
              {s.sub && <p className="text-xs font-bold mt-1 opacity-70">{s.sub}</p>}
            </Card>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No quotations found</p>
          </div>
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Project</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Client</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Description</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    {canEdit && <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((q) => (
                    <tr key={q._id} className="group hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-5">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {q.projectId?.projectName || "—"}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-medium text-slate-600">{q.clientId?.clientName || "—"}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-black text-slate-900">₹{(q.totalAmount || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-medium text-slate-500 max-w-xs truncate block">{q.description || "—"}</span>
                      </td>
                      <td className="px-8 py-5">
                        {canEdit ? (
                          <select value={q.status} onChange={(e) => handleUpdateStatus(q._id, e.target.value)}
                            className={cn(
                              "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500",
                              STATUS_STYLES[q.status]
                            )}>
                            <option value="DRAFT">Draft</option>
                            <option value="SENT">Sent</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                        ) : (
                          <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border", STATUS_STYLES[q.status])}>
                            {q.status}
                          </span>
                        )}
                      </td>
                      {canEdit && (
                        <td className="px-8 py-5 text-right">
                          <button onClick={() => handleDelete(q._id)} disabled={deletingId === q._id}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50">
                            {deletingId === q._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setForm(emptyForm); setError(""); }} title="Create Quotation">
        <form onSubmit={handleCreate} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold text-center">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Project *</label>
              <select required
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                value={form.projectId} onChange={(e) => handleProjectChange(e.target.value)}>
                <option value="">Select project</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Client *</label>
              <select required
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                value={form.clientId} onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}>
                <option value="">Select client</option>
                {clients.map((c) => <option key={c._id} value={c._id}>{c.clientName}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Total Amount (₹) *</label>
              <Input type="number" placeholder="e.g. 500000" value={form.totalAmount}
                onChange={(e) => setForm((f) => ({ ...f, totalAmount: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Status</label>
              <select
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}>
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Description</label>
            <textarea
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
              placeholder="Scope of work, materials, etc."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => { setIsModalOpen(false); setForm(emptyForm); setError(""); }}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : "Create Quotation"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
