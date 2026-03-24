"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Phone, Mail, ArrowUpRight, MapPin, FileText, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth-context";
import { API_BASE_URL } from "@/lib/api-config";

interface Client {
  _id: string;
  clientName: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  paymentStatus?: string;
}

const emptyForm = { clientName: "", email: "", phone: "", address: "", notes: "" };

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/client`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const payload = await res.json();
      
      // Handle different payload structures (e.g., { data: [] } or just [])
      const data = Array.isArray(payload) ? payload : (payload.data || payload.clients || []);
      setClients(data);
    } catch (err) {
      console.error("Fetch clients error:", err);
      setError("Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const roleName = typeof user?.role === "object" ? user.role.roleName : (user?.role || "");
  const canAdd =
    roleName.toLowerCase().includes("architect") ||
    roleName.toLowerCase().includes("admin") ||
    (typeof user?.role === "object" && user.role.permissions?.some(p => p.module === "CLIENT" && p.actions.includes("CREATE")));

  const filteredClients = (clients || []).filter(client =>
    client.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("auth_token");
      await fetch(`${API_BASE_URL}/client/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      console.error("Delete client error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName.trim()) return;
    
    setSubmitting(true);
    setError("");
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/client`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || errData.error || "Failed to add client");
      }

      const result = await res.json();
      const plain = result.plainPassword || result.client?.plainPassword;
      if (plain) {
        alert(`✅ Client created!\n\nLogin Password: ${plain}\n\n(Save this — it won't be shown again)`);
      }

      await fetchClients();
      setForm(emptyForm);
      setIsAddModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Client Directory</h2>
            <p className="text-sm font-medium text-slate-500 hidden sm:block">Manage client relationships and project assignments</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <Input placeholder="Search clients..." icon={Search} className="w-64"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            {canAdd && (
              <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-lg shadow-indigo-200">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Client</span>
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Loading clients...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No clients found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredClients.map((client) => (
              <div key={client._id}
                className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-8 transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-2 group">
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl font-bold text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                    {client.clientName?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </div>
                  {canAdd && (
                    <button
                      onClick={() => handleDelete(client._id)}
                      disabled={deletingId === client._id}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {deletingId === client._id
                        ? <Loader2 className="w-5 h-5 animate-spin" />
                        : <Trash2 className="w-5 h-5" />}
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{client.clientName}</h3>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium truncate">{client.address || "No address provided"}</span>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-slate-500 group-hover:text-indigo-600 transition-colors">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 group-hover:text-indigo-600 transition-colors">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">{client.email}</span>
                  </div>
                  {client.notes && (
                    <div className="flex items-start gap-3 text-slate-400 group-hover:text-indigo-400 transition-colors">
                      <FileText className="w-4 h-4 mt-0.5" />
                      <p className="text-xs italic leading-relaxed line-clamp-2">{client.notes}</p>
                    </div>
                  )}
                </div>

                <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-2xl text-sm font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100 flex items-center justify-center gap-2 group/btn">
                  View Project Portfolio
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </button>

              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setForm(emptyForm); setError(""); }} title="Add New Client">
        <form className="space-y-6" onSubmit={handleAdd}>
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold text-center">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Client Name *</label>
            <Input placeholder="e.g., XYZ Forum" value={form.clientName}
              onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
              <Input type="email" placeholder="e.g., divyraj@example.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
              <Input placeholder="e.g., 7016228814" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Office Address</label>
            <Input placeholder="e.g., 123, LA" value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))} icon={MapPin} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Notes</label>
            <textarea 
              placeholder="Any specific requirements..." 
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all min-h-[100px] resize-none"
            />
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => { setIsAddModalOpen(false); setForm(emptyForm); setError(""); }} type="button" disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : "Save Client"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
        