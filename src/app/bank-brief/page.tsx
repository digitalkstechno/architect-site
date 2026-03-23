
"use client";

import { useState } from "react";
import { 
  Plus, 
  Landmark, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Activity,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useFinance } from "@/lib/finance-store";
import { toast } from "react-toastify";

export default function BankBriefPage() {
  const { bankBriefs, addBank } = useFinance();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    openingBalance: "",
  });

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBank({
        ...form,
        openingBalance: parseFloat(form.openingBalance),
      });

      setIsAddModalOpen(false);
      setForm({ bankName: "", accountNumber: "", ifscCode: "", openingBalance: "" });
      toast.success("Bank account added successfully!");
    } catch (err: any) {
      toast.error(err.message || "Error adding bank account");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Bank Brief</h2>
          <p className="text-sm font-medium text-slate-500">Manage centralized bank accounts and balances</p>
        </div>
        
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-lg shadow-indigo-200 h-11">
          <Plus className="w-5 h-5" />
          Add Account
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {bankBriefs.map((bank) => (
          <Card key={bank._id} className="p-10 space-y-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300 rounded-[2.5rem] border-slate-200">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Landmark className="w-24 h-24 text-slate-900" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-100">
                  <Landmark className="w-6 h-6 text-white" />
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                  bank.isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-400 border border-slate-200"
                )}>
                  {bank.isActive ? "Active" : "Disabled"}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{bank.bankName}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">A/C: {bank.accountNumber}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Balance</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">₹{(bank.currentBalance || 0).toLocaleString()}</p>
            </div>

            <Button variant="outline" className="w-full gap-2 font-bold group h-11 rounded-2xl">
              Manage Bank <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Card>
        ))}
        
        <button onClick={() => setIsAddModalOpen(true)} className="h-full min-h-[300px] border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group">
          <div className="bg-slate-100 p-4 rounded-full group-hover:bg-indigo-100 transition-colors">
            <Plus className="w-8 h-8 text-slate-400 group-hover:text-indigo-600" />
          </div>
          <p className="text-sm font-bold text-slate-500 group-hover:text-indigo-600">Connect New Bank Account</p>
        </button>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Connect Bank Account">
        <form className="space-y-6" onSubmit={handleAddBank}>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Bank Name</label>
            <Input 
              placeholder="e.g. State Bank of India" 
              required 
              value={form.bankName}
              onChange={e => setForm({ ...form, bankName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
            <Input 
              placeholder="Enter 12-digit A/C number" 
              required 
              value={form.accountNumber}
              onChange={e => setForm({ ...form, accountNumber: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">IFSC Code</label>
              <Input 
                placeholder="SBIN000..." 
                required 
                value={form.ifscCode}
                onChange={e => setForm({ ...form, ifscCode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Opening Balance</label>
              <Input 
                type="number" 
                placeholder="0.00" 
                required 
                value={form.openingBalance}
                onChange={e => setForm({ ...form, openingBalance: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} className="font-bold">Cancel</Button>
            <Button type="submit" className="font-bold">Connect Account</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
