"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Phone, Trash2, Loader2, HardHat, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";

interface Worker {
  _id: string;
  name: string;
  phone?: string;
  skill?: string;
  experienceYears?: number;
  wageType?: "DAILY" | "CONTRACT";
  dailyWage?: number;
  contractAmount?: number;
}

const emptyForm = {
  name: "",
  phone: "",
  skill: "",
  experienceYears: "",
  wageType: "DAILY" as "DAILY" | "CONTRACT",
  dailyWage: "",
  contractAmount: "",
};

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);

  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const fetchWorkers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:9000/architecture/worker", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await res.json();
      setWorkers(payload.Workers || []);
    } catch (err) {
      console.error("Fetch workers error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchWorkers(); }, [fetchWorkers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const body: any = {
        name: form.name,
        phone: form.phone,
        skill: form.skill,
        wageType: form.wageType,
      };
      if (form.experienceYears) body.experienceYears = Number(form.experienceYears);
      if (form.wageType === "DAILY" && form.dailyWage) body.dailyWage = Number(form.dailyWage);
      if (form.wageType === "CONTRACT" && form.contractAmount) body.contractAmount = Number(form.contractAmount);

      const res = await fetch("http://localhost:9000/architecture/worker", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || payload.message || "Failed to create worker");
      setIsModalOpen(false);
      setForm(emptyForm);
      fetchWorkers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this worker?")) return;
    setDeletingId(id);
    try {
      await fetch(`http://localhost:9000/architecture/worker/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkers((prev) => prev.filter((w) => w._id !== id));
    } catch (err) {
      console.error("Delete worker error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = workers.filter(
    (w) =>
      w.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.skill?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Worker Directory</h2>
            <p className="text-sm font-medium text-slate-500 hidden sm:block">Manage your workforce</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <Input placeholder="Search by name or skill..." icon={Search} className="w-64"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Register Worker</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No workers found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((w) => (
              <Card key={w._id} className="p-6 space-y-5 group hover:border-indigo-200 transition-all">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl font-bold text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                    {w.name?.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </div>
                  <button onClick={() => handleDelete(w._id)} disabled={deletingId === w._id}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50">
                    {deletingId === w._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{w.name}</h3>
                  {w.skill && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-[10px] font-bold text-indigo-700 rounded-lg border border-indigo-100 uppercase tracking-wider">
                      <HardHat className="w-3 h-3" />{w.skill}
                    </span>
                  )}
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-50">
                  {w.phone && (
                    <div className="flex items-center gap-3 text-slate-500">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">{w.phone}</span>
                    </div>
                  )}
                  {w.experienceYears !== undefined && (
                    <div className="flex items-center gap-3 text-slate-500">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">{w.experienceYears} yrs experience</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm pt-1">
                    <span className="font-medium text-slate-500">{w.wageType === "DAILY" ? "Daily Wage" : "Contract"}</span>
                    <span className="font-bold text-slate-900">
                      {w.wageType === "DAILY" ? (w.dailyWage ? `₹${w.dailyWage}` : "—") : (w.contractAmount ? `₹${w.contractAmount}` : "—")}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setForm(emptyForm); setError(""); }} title="Register New Worker">
        <form onSubmit={handleCreate} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold text-center">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Full Name *</label>
              <Input placeholder="e.g. Ramesh Kumar" value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Phone</label>
              <Input placeholder="e.g. 9876543210" value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Skill</label>
              <Input placeholder="e.g. Mason, Electrician" value={form.skill}
                onChange={(e) => setForm((f) => ({ ...f, skill: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Experience (years)</label>
              <Input type="number" placeholder="e.g. 5" value={form.experienceYears}
                onChange={(e) => setForm((f) => ({ ...f, experienceYears: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Wage Type</label>
              <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.wageType} onChange={(e) => setForm((f) => ({ ...f, wageType: e.target.value as "DAILY" | "CONTRACT" }))}>
                <option value="DAILY">Daily Wage</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">
                {form.wageType === "DAILY" ? "Daily Wage (₹)" : "Contract Amount (₹)"}
              </label>
              {form.wageType === "DAILY" ? (
                <Input type="number" placeholder="e.g. 500" value={form.dailyWage}
                  onChange={(e) => setForm((f) => ({ ...f, dailyWage: e.target.value }))} />
              ) : (
                <Input type="number" placeholder="e.g. 50000" value={form.contractAmount}
                  onChange={(e) => setForm((f) => ({ ...f, contractAmount: e.target.value }))} />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => { setIsModalOpen(false); setForm(emptyForm); setError(""); }}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Registering...</> : "Register Worker"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
