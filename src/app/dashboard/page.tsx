"use client";

import { useEffect, useState } from "react";
import { dashboardService, DashboardStats } from "@/services/dashboard.service";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  Briefcase, Construction, Clock, CreditCard,
  CheckCircle, HardHat, FileText, Activity,
  TrendingUp, MessageSquare, AlertCircle, Calendar, Building2
} from "lucide-react";
import { cn, formatDateForDisplay } from "@/lib/utils";
import toast from "react-hot-toast";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";

export default function CompleteDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await dashboardService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
        toast.error("Failed to load real-time dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 opacity-20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 border-l-indigo-600 animate-spin"></div>
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Initializing Interface...</p>
      </div>
    );
  }

  if (!stats) return null;

  const summaryCards = [
    { label: "Active Projects", value: stats.projects.active, icon: Construction, fromColor: "from-blue-500", toColor: "to-blue-700", shadow: "shadow-blue-500/20" },
    { label: "Completed Projects", value: stats.projects.completed, icon: CheckCircle, fromColor: "from-emerald-400", toColor: "to-emerald-600", shadow: "shadow-emerald-500/20" },
    { label: "Pending Site Tasks", value: stats.tasks.site.pending, icon: HardHat, fromColor: "from-orange-400", toColor: "to-orange-600", shadow: "shadow-orange-500/20" },
    { label: "Pending Office Tasks", value: stats.tasks.office.pending, icon: FileText, fromColor: "from-purple-500", toColor: "to-purple-700", shadow: "shadow-purple-500/20" },
  ];

  const calculatePercentage = (part: number, total: number) => total > 0 ? Math.round((part / total) * 100) : 0;
  const receivedPercentage = calculatePercentage(stats.finances.totalReceived, stats.finances.totalBudget);

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-12 w-full p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto bg-slate-50/30">

      {/* Premium Header */}


      {/* Advanced Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, idx) => (
          <div key={idx} className="group relative p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/60 transition-all duration-500 hover:-translate-y-2 shadow-sm hover:shadow-2xl overflow-hidden">
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500", card.fromColor, card.toColor)}></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={cn("p-3.5 rounded-2xl bg-gradient-to-br text-white shadow-lg", card.fromColor, card.toColor, card.shadow)}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>

            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{card.label}</p>
              <h3 className="text-4xl font-black text-slate-800 tracking-tighter">
                {card.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-8">

        {/* Financial Health */}
        <div className="space-y-8">
          {!stats.finances.isHidden && (
            <Card className="rounded-[2rem] border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden bg-white/90 backdrop-blur-xl hover:shadow-xl transition-shadow duration-500">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6 md:p-8">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/20">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black tracking-tight text-slate-800">Financial Health</CardTitle>
                    <p className="text-xs font-medium text-slate-400 mt-1">Overview of project revenue and outstandings</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                  <div className="space-y-2 relative group">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-slate-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Estimated Budget</p>
                    <p className="text-3xl font-black text-slate-800 tracking-tighter">{stats.finances.totalBudget.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="space-y-2 relative group">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Received Amount</p>
                    <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600 tracking-tighter">{stats.finances.totalReceived.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="space-y-2 relative group">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Pending Collection</p>
                    <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 tracking-tighter">{stats.finances.totalPending.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Collection Rate</span>
                    <span className="text-lg font-black text-emerald-600">{receivedPercentage}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-200/50 rounded-full overflow-hidden shadow-inner relative">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 rounded-full"
                      style={{ width: `${receivedPercentage}%`, transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:20px_20px] animate-[shimmer_2s_infinite_linear]"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending Agency Requests */}
          {stats.recentActivity.pendingAgencies && stats.recentActivity.pendingAgencies.length > 0 && (
            <Card className="rounded-[2rem] shadow-lg shadow-slate-200/40 border-slate-200/60 bg-white/90 backdrop-blur-xl hover:shadow-xl transition-shadow duration-500">
              <CardHeader className="pb-4 pt-6 px-6">
                <CardTitle className="text-xs font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg"><Building2 className="w-3.5 h-3.5 text-blue-600" /></div>
                  Pending Agency Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-6 pb-6">
                {stats.recentActivity.pendingAgencies.map((agency: any) => (
                  <Link href={`/agency-approvals/${agency._id}`} key={agency._id}>
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row md:justify-between md:items-center gap-4 group hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                      <div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{agency.agencyName}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{agency.businessType?.name || "Agency"}</p>
                      </div>
                      <div className="flex flex-col md:items-end gap-1">
                        <p className="text-xs font-medium text-slate-500">{agency.mobile}</p>
                        <p className="text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-md">{formatDateForDisplay(agency.createdAt)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Upcoming Schedules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="rounded-[2rem] shadow-lg shadow-slate-200/40 border-slate-200/60 bg-white/90 backdrop-blur-xl hover:shadow-xl transition-shadow duration-500">
              <CardHeader className="pb-4 pt-6 px-6">
                <CardTitle className="text-xs font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 rounded-lg"><Clock className="w-3.5 h-3.5 text-indigo-600" /></div>
                  Office Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-6 pb-6">
                {stats.recentActivity.upcomingOfficeTasks.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-100 border-dashed">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No upcoming office tasks</p>
                  </div>
                ) : stats.recentActivity.upcomingOfficeTasks.map(task => (
                  <div key={task._id} className="p-4 rounded-2xl bg-white border border-slate-200 flex justify-between items-center group hover:border-indigo-300 hover:shadow-md transition-all">
                    <div>
                      <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{task.title}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{task.project?.name || "General"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-md">{formatDateForDisplay(task.endDate)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] shadow-lg shadow-slate-200/40 border-slate-200/60 bg-white/90 backdrop-blur-xl hover:shadow-xl transition-shadow duration-500">
              <CardHeader className="pb-4 pt-6 px-6">
                <CardTitle className="text-xs font-black text-orange-900 uppercase tracking-widest flex items-center gap-2">
                  <div className="p-1.5 bg-orange-100 rounded-lg"><Calendar className="w-3.5 h-3.5 text-orange-600" /></div>
                  Site Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-6 pb-6">
                {stats.recentActivity.upcomingSiteTasks.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-100 border-dashed">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No upcoming site tasks</p>
                  </div>
                ) : stats.recentActivity.upcomingSiteTasks.map(task => (
                  <div key={task._id} className="p-4 rounded-2xl bg-white border border-slate-200 flex justify-between items-center group hover:border-orange-300 hover:shadow-md transition-all">
                    <div>
                      <p className="text-sm font-bold text-slate-800 group-hover:text-orange-600 transition-colors">{task.title}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{task.project?.name || "General"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-md">{formatDateForDisplay(task.startDate)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
