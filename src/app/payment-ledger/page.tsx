
"use client";

import { useState } from "react";
import { 
  Plus, 
  Wallet, 
  Search, 
  TrendingUp,
  TrendingDown,
  CreditCard,
  ChevronRight,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useFinance } from "@/lib/finance-store";
import { useAuth } from "@/lib/auth-context";

export default function PaymentLedgerPage() {
  const { ledger, bankBriefs, addTransaction, isLoading } = useFinance();
  const { projects } = useProjects();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [form, setForm] = useState({
    projectId: "",
    clientId: "",
    bankId: "",
    amount: "",
    transactionType: "CREDIT" as const,
    source: "Client Advance",
    description: "",
  });

  const totalRevenue = ledger
    .filter(e => e.transactionType === "CREDIT")
    .reduce((sum, e) => sum + e.amount, 0);
  
  const totalExpenses = ledger
    .filter(e => e.transactionType === "DEBIT")
    .reduce((sum, e) => sum + e.amount, 0);

  const filteredLedger = ledger.filter(e => 
    e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.source?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await addTransaction({
      projectId: form.projectId,
      clientId: form.clientId,
      bankId: form.bankId,
      transactionType: form.transactionType,
      amount: parseFloat(form.amount),
      source: form.source,
      description: form.description,
    });
    
    setIsAddModalOpen(false);
    setForm({
      projectId: "",
      clientId: "",
      bankId: "",
      amount: "",
      transactionType: "CREDIT",
      source: "Client Advance",
      description: "",
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payment Ledger</h2>
          <p className="text-sm font-medium text-slate-500">Centralized financial transaction history</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search ledger..." 
              className="pl-10 w-64 h-10" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-lg shadow-indigo-200 h-11">
            <Plus className="w-5 h-5" />
            Record Payment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Expenses", value: `₹${totalExpenses.toLocaleString()}`, icon: TrendingDown, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Net Cash Flow", value: `₹${(totalRevenue - totalExpenses).toLocaleString()}`, icon: Wallet, color: "text-indigo-600", bg: "bg-indigo-50" },
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
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description / Source</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Bank Account</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLedger.map((entry) => (
                <tr key={entry._id} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{entry.description || "No description"}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{entry.source}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={cn(
                      "text-sm font-black",
                      entry.transactionType === "CREDIT" ? "text-emerald-600" : "text-orange-600"
                    )}>
                      {entry.transactionType === "CREDIT" ? "+" : "-"}₹{entry.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest",
                      entry.transactionType === "CREDIT" ? "bg-green-50 text-green-700 border-green-100" : "bg-orange-50 text-orange-700 border-orange-100"
                    )}>
                      {entry.transactionType}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-sm font-bold text-slate-700">
                      {bankBriefs.find(b => b._id === entry.bankId)?.bankName || "—"}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-500">{new Date(entry.createdAt || entry.date).toLocaleDateString()}</td>
                </tr>
              ))}
              {ledger.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CreditCard className="w-12 h-12 text-slate-200" />
                      <p className="text-sm font-bold text-slate-400">No transactions recorded yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Record Transaction">
        <form className="space-y-6" onSubmit={handleRecordPayment}>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Project</label>
              <select 
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.projectId}
                onChange={e => setForm({ ...form, projectId: e.target.value })}
              >
                <option value="">Select project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Bank Account</label>
              <select 
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.bankId}
                onChange={e => setForm({ ...form, bankId: e.target.value })}
              >
                <option value="">Select bank</option>
                {bankBriefs.map(b => <option key={b._id} value={b._id}>{b.bankName} - {b.accountNumber}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Transaction Type</label>
              <select 
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.transactionType}
                onChange={e => setForm({ ...form, transactionType: e.target.value as any })}
              >
                <option value="CREDIT">CREDIT (Income)</option>
                <option value="DEBIT">DEBIT (Expense)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Amount (₹)</label>
              <Input 
                type="number"
                placeholder="0.00" 
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Source / Category</label>
            <Input 
              placeholder="e.g. Client Advance, Material Purchase, Labor Wage" 
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
            <textarea 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
              placeholder="Enter transaction details..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} className="font-bold">Cancel</Button>
            <Button type="submit" className="font-bold">Record Transaction</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
