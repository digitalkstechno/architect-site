"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Wallet, Landmark, ArrowUpRight, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { useFinance } from "@/lib/finance-store";
import { useProjects } from "@/lib/projects-store";
import Link from "next/link";

export default function FinancePage() {
  const { ledger, bankBriefs, isLoading } = useFinance();
  const { projects } = useProjects();

  const totalRevenue = useMemo(
    () => ledger.filter((e) => e.transactionType === "CREDIT").reduce((s, e) => s + e.amount, 0),
    [ledger]
  );
  const totalExpenses = useMemo(
    () => ledger.filter((e) => e.transactionType === "DEBIT").reduce((s, e) => s + e.amount, 0),
    [ledger]
  );
  const netCashFlow = totalRevenue - totalExpenses;
  const totalBankBalance = useMemo(
    () => bankBriefs.reduce((s, b) => s + (b.currentBalance || 0), 0),
    [bankBriefs]
  );

  const projectFinancials = useMemo(
    () =>
      projects.map((p) => {
        const entries = ledger.filter((e) => e.projectId === p.id);
        const received = entries.filter((e) => e.transactionType === "CREDIT").reduce((s, e) => s + e.amount, 0);
        const spent = entries.filter((e) => e.transactionType === "DEBIT").reduce((s, e) => s + e.amount, 0);
        const budget = Number(p.budget.replace(/[^0-9.-]+/g, "")) || 0;
        return { ...p, received, spent, budget, pending: budget - received };
      }),
    [projects, ledger]
  );

  const recentTransactions = useMemo(
    () => [...ledger].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8),
    [ledger]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Finance Overview</h2>
          <p className="text-sm font-medium text-slate-500 hidden sm:block">Consolidated financial health across all projects</p>
        </div>
        <div className="flex gap-3">
          <Link href="/payment-ledger"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            Ledger <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link href="/bank-brief"
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 rounded-xl text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            Bank Accounts <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "Total Expenses", value: `₹${totalExpenses.toLocaleString()}`, icon: TrendingDown, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Net Cash Flow", value: `₹${netCashFlow.toLocaleString()}`, icon: Wallet, color: netCashFlow >= 0 ? "text-indigo-600" : "text-red-600", bg: netCashFlow >= 0 ? "bg-indigo-50" : "bg-red-50" },
          { label: "Bank Balance", value: `₹${totalBankBalance.toLocaleString()}`, icon: Landmark, color: "text-blue-600", bg: "bg-blue-50" },
        ].map((stat) => (
          <Card key={stat.label} className="p-6 flex items-center gap-5">
            <div className={cn("p-4 rounded-2xl flex-shrink-0", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest truncate">{stat.label}</p>
              <p className="text-xl font-black text-slate-900 tracking-tight mt-0.5">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Financials */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Project-wise Financials</h3>
          <Card className="overflow-hidden p-0">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Project</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Budget</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Received</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Spent</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projectFinancials.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm font-bold text-slate-400">No projects found</td>
                  </tr>
                ) : (
                  projectFinancials.map((p) => (
                    <tr key={p.id} className="group hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/projects/${p.id}`} className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {p.name}
                        </Link>
                        <p className="text-xs text-slate-400 font-medium">{p.client}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">₹{p.budget.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-bold text-green-700">₹{p.received.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-bold text-orange-700">₹{p.spent.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-bold text-indigo-700">₹{p.pending.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
            <Link href="/payment-ledger" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View all</Link>
          </div>
          <Card className="p-0 overflow-hidden divide-y divide-slate-100">
            {recentTransactions.length === 0 ? (
              <div className="p-8 text-center">
                <IndianRupee className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No transactions yet</p>
              </div>
            ) : (
              recentTransactions.map((entry) => (
                <div key={entry._id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn("p-2 rounded-xl flex-shrink-0", entry.transactionType === "CREDIT" ? "bg-green-50" : "bg-orange-50")}>
                      {entry.transactionType === "CREDIT"
                        ? <TrendingUp className="w-4 h-4 text-green-600" />
                        : <TrendingDown className="w-4 h-4 text-orange-600" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{entry.description || "Transaction"}</p>
                      <p className="text-[10px] font-medium text-slate-400">{new Date(entry.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={cn("text-sm font-black flex-shrink-0 ml-3", entry.transactionType === "CREDIT" ? "text-green-600" : "text-orange-600")}>
                    {entry.transactionType === "CREDIT" ? "+" : "-"}₹{entry.amount.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </Card>

          {/* Bank Accounts Summary */}
          <h3 className="text-base font-bold text-slate-900 pt-2">Bank Accounts</h3>
          <div className="space-y-3">
            {bankBriefs.length === 0 ? (
              <Card className="p-5 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No bank accounts</p>
              </Card>
            ) : (
              bankBriefs.map((bank) => (
                <Card key={bank._id} className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-xl">
                      <Landmark className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{bank.bankName}</p>
                      <p className="text-[10px] font-medium text-slate-400">A/C: {bank.accountNumber}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-slate-900">₹{(bank.currentBalance || 0).toLocaleString()}</span>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
