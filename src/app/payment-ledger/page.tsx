
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
  const { user } = useAuth();
  const { ledger, addTransaction } = useFinance();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [form, setForm] = useState({
    project: "",
    client: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    type: "CREDIT" as const,
  });

  const totalRevenue = ledger
    .filter(e => e.type === "CREDIT")
    .reduce((sum, e) => sum + e.amount, 0);
  
  const totalExpenses = ledger
    .filter(e => e.type === "DEBIT")
    .reduce((sum, e) => sum + e.amount, 0);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    addTransaction({
      tenantId: user.id,
      type: form.type,
      amount: parseFloat(form.amount.replace(/[^0-9.]/g, "")),
      description: `${form.type === "CREDIT" ? "Payment from" : "Payment to"} ${form.client} for ${form.project}`,
      date: form.date,
    });
    
    setIsAddModalOpen(false);
    setForm({
      project: "",
      client: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      type: "CREDIT",
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
            <Input placeholder="Search ledger..." className="pl-10 w-64 h-10" />
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-lg shadow-indigo-200 h-11">
            <Plus className="w-5 h-5" />
            Record Payment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Expenses", value: `$${totalExpenses.toLocaleString()}`, icon: TrendingDown, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Net Cash Flow", value: `$${(totalRevenue - totalExpenses).toLocaleString()}`, icon: Wallet, color: "text-indigo-600", bg: "bg-indigo-50" },
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
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Balance After</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledger.map((entry) => (
                <tr key={entry.id} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{entry.description}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">REF: {entry.id.toUpperCase()}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={cn(
                      "text-sm font-black",
                      entry.type === "CREDIT" ? "text-emerald-600" : "text-orange-600"
                    )}>
                      {entry.type === "CREDIT" ? "+" : "-"}${entry.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest",
                      entry.type === "CREDIT" ? "bg-green-50 text-green-700 border-green-100" : "bg-orange-50 text-orange-700 border-orange-100"
                    )}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-sm font-black text-slate-900">${entry.balanceAfter.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-500">{entry.date}</td>
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
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Project Name</label>
            <Input 
              placeholder="e.g. Modern Villa" 
              value={form.project}
              onChange={(e) => setForm({ ...form, project: e.target.value })}
              required 
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Entity Name</label>
              <Input 
                placeholder="Client/Worker Name" 
                value={form.client}
                onChange={(e) => setForm({ ...form, client: e.target.value })}
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Amount</label>
              <Input 
                placeholder="0.00" 
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Transaction Date</label>
              <Input 
                type="date" 
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
              <select 
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="CREDIT">Payment Inflow (Credit)</option>
                <option value="DEBIT">Expense Outflow (Debit)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} className="font-bold">Cancel</Button>
            <Button type="submit" className="font-bold">Record Transaction</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
