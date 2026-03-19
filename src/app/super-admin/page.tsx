
"use client";

import { useEffect, useState } from "react";
import { Building2, Users, CreditCard, Activity, TrendingUp, ChevronRight, CheckCircle2, Clock, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { saFetch } from "@/lib/superadmin-api";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SuperAdminHome() {
  const [stats, setStats] = useState({
    tenants: 0,
    users: 0,
    subscriptions: 0,
    clients: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [t, u, s, c] = await Promise.all([
          saFetch("/tenant"),
          saFetch("/user"),
          saFetch("/subscription-plans"),
          saFetch("/client")
        ]);
        setStats({
          tenants: Array.isArray(t) ? t.length : 0,
          users: Array.isArray(u) ? u.length : 0,
          subscriptions: Array.isArray(s) ? s.length : 0,
          clients: Array.isArray(c) ? c.length : 0
        });
      } catch (e) {
        console.error("Failed to load stats", e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const metrics = [
    { label: "Total Tenants", value: stats.tenants, icon: Building2, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Platform Users", value: stats.users, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Plans", value: stats.subscriptions, icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Clients", value: stats.clients, icon: UserCheck, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">SaaS Control Plane</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Architect Management</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-bold text-slate-700 uppercase tracking-widest">Infrastructure Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => (
          <Card key={m.label} className="p-8 space-y-4 hover:shadow-lg transition-all duration-300 rounded-[2rem]">
            <div className={cn("p-4 rounded-2xl w-fit", m.bg)}>
              <m.icon className={cn("w-6 h-6", m.color)} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
              <h2 className="text-3xl font-black text-slate-900 mt-1">{loading ? "..." : m.value}</h2>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-10 space-y-8 rounded-[2.5rem]">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recent Onboarding</h3>
            <Link href="/super-admin/tenant" className="text-xs font-bold text-indigo-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm font-bold">T{i}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Loading...</p>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Active Subscription</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-10 space-y-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl">
          <h3 className="text-xl font-black uppercase tracking-tight">System Status</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">API Gateway</span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">Operational</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Database Cluster</span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">Healthy</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Centralized Ledger</span>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">Syncing</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
