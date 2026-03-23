
"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  FileText, 
  Calculator,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Eye,
  Download,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useProjects } from "@/lib/projects-store";
import { useFinance } from "@/lib/finance-store";
import { useEffect } from "react";

export default function ProjectEstimationPage() {
  const { projects } = useProjects();
  const { addTransaction, bankBriefs } = useFinance();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [estimations, setEstimations] = useState<any[]>([]);
  const [selectedEstimation, setSelectedEstimation] = useState<any>(null);
  const [advanceForm, setAdvanceForm] = useState({
    bankId: "",
    amount: "",
    description: "Advance payment received after estimation approval",
  });

  const [newEstimation, setNewEstimation] = useState({
    projectId: "",
    totalAmount: "",
    description: "",
  });

  const fetchEstimations = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      const res = await fetch("http://localhost:9000/architecture/projectestimation", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload = await res.json();
      setEstimations(payload.projects || payload.data || payload || []);
    } catch (err) {
      console.error("Fetch estimations error:", err);
    }
  };

  useEffect(() => {
    fetchEstimations();
  }, []);

  const handleCreateEstimation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const project = projects.find(p => p.id === newEstimation.projectId);
      const res = await fetch("http://localhost:9000/architecture/projectestimation", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          projectId: newEstimation.projectId,
          clientId: project?.clientId,
          totalAmount: parseFloat(newEstimation.totalAmount),
          description: newEstimation.description,
          status: "DRAFT"
        })
      });

      if (!res.ok) throw new Error("Failed to create estimation");
      
      setIsAddModalOpen(false);
      setNewEstimation({ projectId: "", totalAmount: "", description: "" });
      fetchEstimations();
      toast.success("Estimation created successfully!");
    } catch (err: any) {
      toast.error(err.message || "Error creating estimation");
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      await fetch(`http://localhost:9000/architecture/projectestimation/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchEstimations();
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  const handleRecordAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEstimation) return;

    try {
      await addTransaction({
        projectId: selectedEstimation.projectId?._id || selectedEstimation.projectId,
        clientId: selectedEstimation.clientId?._id || selectedEstimation.clientId,
        bankId: advanceForm.bankId,
        transactionType: "CREDIT",
        amount: parseFloat(advanceForm.amount),
        source: "Client Advance",
        description: advanceForm.description,
      });
      
      setIsAdvanceModalOpen(false);
      setSelectedEstimation(null);
      setAdvanceForm({ bankId: "", amount: "", description: "Advance payment received after estimation approval" });
    } catch (err) {
      console.error("Record advance error:", err);
    }
  };

  const filtered = (estimations || []).filter(e => {
    const projName = e.projectId?.projectName || e.project || "";
    const clientName = e.clientId?.clientName || e.client || "";
    return projName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (e._id && e._id.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Project Estimation</h2>
          <p className="text-sm font-medium text-slate-500">Calculate and manage project budgets and quotations</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search estimations..." 
              className="pl-10 w-64 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-lg shadow-indigo-200 h-11">
            <Plus className="w-5 h-5" />
            New Estimation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Total Estimated", value: "$2.1M", icon: Calculator, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Draft Quotes", value: "3", icon: FileText, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Conversion Rate", value: "72%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((stat) => (
          <Card key={stat.label} className="p-6 flex items-center gap-5 hover:shadow-md transition-all duration-300">
            <div className={cn("p-4 rounded-2xl", stat.bg)}>
              <stat.icon className={cn("w-7 h-7", stat.color)} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Est ID / Project</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Total Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((est) => (
                <tr key={est._id} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">{est._id?.slice(-6).toUpperCase()}</p>
                    <p className="text-sm font-bold text-slate-900">{est.projectId?.projectName || est.project || "—"}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-700">{est.clientId?.clientName || est.client || "—"}</p>
                    <p className="text-xs font-medium text-slate-400">{est.createdAt ? new Date(est.createdAt).toLocaleDateString() : est.date}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-sm font-black text-slate-900">₹{(est.totalAmount || 0).toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <select 
                      value={est.status} 
                      onChange={(e) => updateStatus(est._id, e.target.value)}
                      className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest bg-white focus:outline-none",
                        est.status === "SENT" || est.status === "NEGOTIATION" ? "text-orange-600 border-orange-100" :
                        est.status === "DRAFT" ? "text-slate-600 border-slate-200" :
                        "text-emerald-700 border-emerald-100"
                      )}
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="NEGOTIATION">NEGOTIATION</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2">
                      {est.status === "APPROVED" && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 text-[10px] gap-1"
                          onClick={() => {
                            setSelectedEstimation(est);
                            setIsAdvanceModalOpen(true);
                            setAdvanceForm(f => ({ ...f, amount: est.totalAmount?.toString() || "" }));
                          }}
                        >
                          <DollarSign className="w-3 h-3" />
                          Record Advance
                        </Button>
                      )}
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isAdvanceModalOpen} onClose={() => setIsAdvanceModalOpen(false)} title="Record Advance Payment">
        <form className="space-y-6" onSubmit={handleRecordAdvance}>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Select Bank Account</label>
            <select 
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={advanceForm.bankId}
              onChange={e => setAdvanceForm(f => ({ ...f, bankId: e.target.value }))}
            >
              <option value="">Select a bank</option>
              {bankBriefs.map(b => <option key={b._id} value={b._id}>{b.bankName} - {b.accountNumber}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Advance Amount (₹)</label>
            <Input 
              type="number"
              placeholder="e.g. 200000" 
              required 
              value={advanceForm.amount}
              onChange={e => setAdvanceForm(f => ({ ...f, amount: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
            <textarea 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
              value={advanceForm.description}
              onChange={e => setAdvanceForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAdvanceModalOpen(false)} className="font-bold">Cancel</Button>
            <Button type="submit" className="font-bold">Record Payment</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="New Project Estimation">
        <form className="space-y-6" onSubmit={handleCreateEstimation}>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Select Project</label>
            <select 
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newEstimation.projectId}
              onChange={e => setNewEstimation({ ...newEstimation, projectId: e.target.value })}
            >
              <option value="">Select a project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Total Estimated Amount (₹)</label>
            <Input 
              type="number"
              placeholder="e.g. 1500000" 
              required 
              value={newEstimation.totalAmount}
              onChange={e => setNewEstimation({ ...newEstimation, totalAmount: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Description / Notes</label>
            <textarea 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
              placeholder="Full interior design including furniture, lighting, and painting work."
              value={newEstimation.description}
              onChange={e => setNewEstimation({ ...newEstimation, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} className="font-bold">Cancel</Button>
            <Button type="submit" className="font-bold">Create Estimation</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
