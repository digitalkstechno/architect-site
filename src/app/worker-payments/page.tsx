"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Trash2, Loader2, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { useProjects } from "@/lib/projects-store";

interface WorkerPayment {
  _id: string;
  workerId: { _id: string; name: string } | null;
  projectId: { _id: string; projectName: string } | null;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
}

const emptyForm = {
  workerId: "",
  projectId: "",
  amount: "",
  paymentDate: new Date().toISOString().split("T")[0],
  paymentMethod: "CASH",
};

export default function WorkerPaymentsPage() {
  const { projects } = useProjects();
  const [payments, setPayments] = useState<WorkerPayment[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
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
      const [paymentsRes, workersRes] = await Promise.all([
        fetch("http://localhost:9000/architecture/workerpayment", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:9000/architecture/worker", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const paymentsData = await paymentsRes.json();
      const workersData = await workersRes.json();
      setPayments(paymentsData.workerpayments || paymentsData.data || []);
      setWorkers(workersData.Workers || []);
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
      const res = await fetch("http://localhost:9000/architecture/workerpayment", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          workerId: form.workerId,
          projectId: form.projectId,
          amount: Number(form.amount),
          paymentDate: form.paymentDate,
          paymentMethod: form.paymentMethod,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || payload.message || "Failed to record payment");
      setIsModalOpen(false);
      setForm(emptyForm);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this payment record?")) return;
    setDeletingId(id);
    try {
      await fetch(`http://localhost:9000/architecture/workerpayment/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = payments.filter(
    (p) =>
      p.workerId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectId?.projectName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <>
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Worker Payments</h2>
            <p className="text-sm font-medium text-slate-500 hidden sm:block">Track and manage worker wage disbursements</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <Input placeholder="Search by worker or project..." icon={Search} className="w-64"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Record Payment</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-2xl">
              <IndianRupee className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Paid</p>
              <p className="text-2xl font-black text-slate-900">₹{totalPaid.toLocaleString()}</p>
            </div>
          </Card>
          <Card className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-2xl">
              <IndianRupee className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Records</p>
              <p className="text-2xl font-black text-slate-900">{payments.length}</p>
            </div>
          </Card>
          <Card className="p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-2xl">
              <IndianRupee className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg Payment</p>
              <p className="text-2xl font-black text-slate-900">
                ₹{payments.length ? Math.round(totalPaid / payments.length).toLocaleString() : 0}
              </p>
            </div>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No payment records found</p>
          </div>
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Worker</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Project</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Method</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((p) => (
                    <tr key={p._id} className="group hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-xs font-bold text-indigo-600 border border-indigo-100">
                            {p.workerId?.name?.split(" ").map((n) => n[0]).join("") || "?"}
                          </div>
                          <span className="text-sm font-bold text-slate-900">{p.workerId?.name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-medium text-slate-600">{p.projectId?.projectName || "—"}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-black text-green-700">₹{(p.amount || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-2.5 py-1 bg-slate-100 text-[10px] font-bold text-slate-600 rounded-lg uppercase tracking-wider">
                          {p.paymentMethod || "—"}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-medium text-slate-500">
                          {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : "—"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button onClick={() => handleDelete(p._id)} disabled={deletingId === p._id}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50">
                          {deletingId === p._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setForm(emptyForm); setError(""); }} title="Record Worker Payment">
        <form onSubmit={handleCreate} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold text-center">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Worker *</label>
              <select required
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                value={form.workerId} onChange={(e) => setForm((f) => ({ ...f, workerId: e.target.value }))}>
                <option value="">Select worker</option>
                {workers.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Project *</label>
              <select required
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                value={form.projectId} onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}>
                <option value="">Select project</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Amount (₹) *</label>
              <Input type="number" placeholder="e.g. 5000" value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Payment Method</label>
              <select
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.paymentMethod} onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}>
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Payment Date</label>
            <Input type="date" value={form.paymentDate}
              onChange={(e) => setForm((f) => ({ ...f, paymentDate: e.target.value }))} />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => { setIsModalOpen(false); setForm(emptyForm); setError(""); }}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Recording...</> : "Record Payment"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
