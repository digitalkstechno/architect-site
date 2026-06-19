"use client";

import { useEffect, useState } from "react";
import { dashboardService, DashboardStats } from "@/services/dashboard.service";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { 
  Briefcase, Construction, Clock, CreditCard, 
  CheckCircle, HardHat, FileText, Activity, 
  TrendingUp, MessageSquare, AlertCircle, Calendar
} from "lucide-react";
import { cn, formatDateForDisplay } from "@/lib/utils";
import toast from "react-hot-toast";
import { StatusBadge } from "@/components/ui/StatusBadge";

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
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading Live Dashboard...</p>
      </div>
    );
  }

  if (!stats) return null;

  const summaryCards = [
    { label: "Active Projects", value: stats.projects.active, icon: Construction, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
    { label: "Completed Projects", value: stats.projects.completed, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
    { label: "Pending Site Tasks", value: stats.tasks.site.pending, icon: HardHat, color: "text-orange-600", bg: "bg-orange-50 border-orange-100" },
    { label: "Pending Office Tasks", value: stats.tasks.office.pending, icon: FileText, color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
  ];

  const calculatePercentage = (part: number, total: number) => total > 0 ? Math.round((part / total) * 100) : 0;
  const receivedPercentage = calculatePercentage(stats.finances.totalReceived, stats.finances.totalBudget);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12 w-full p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 to-indigo-800 p-6 md:p-8 rounded-3xl text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="space-y-2 relative z-10">
          <h1 className="text-3xl font-bold tracking-tight">Complete Overview</h1>
          <p className="text-indigo-200 font-medium">Real-time aggregate data across all ongoing architectural projects.</p>
        </div>
        <div className="relative z-10 flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
          <Activity className="w-5 h-5 text-emerald-400" />
          <span className="font-mono font-medium tracking-wider">LIVE SYNC</span>
        </div>
      </div>

      {/* Advanced Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, idx) => (
          <div key={idx} className={cn("p-6 rounded-3xl border transition-all duration-500 hover:-translate-y-1 shadow-sm hover:shadow-xl bg-white", card.bg)}>
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-2xl bg-white shadow-sm border", card.bg.split(' ')[1])}>
                <card.icon className={cn("w-6 h-6", card.color)} />
              </div>
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{card.label}</p>
            <h3 className="text-4xl font-black text-slate-900 mt-2 font-mono tracking-tight">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Financial Health */}
        <div className="lg:col-span-2 space-y-8">
          {!stats.finances.isHidden && (
          <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <CardTitle className="text-lg font-bold">Financial Health</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Estimated Budget</p>
                  <p className="text-2xl font-black text-slate-900 font-mono">{stats.finances.totalBudget.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Received</p>
                  <p className="text-2xl font-black text-emerald-600 font-mono">{stats.finances.totalReceived.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">Pending</p>
                  <p className="text-2xl font-black text-orange-500 font-mono">{stats.finances.totalPending.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-600">Collection Rate</span>
                  <span className="text-emerald-600">{receivedPercentage}%</span>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 ease-out" 
                    style={{ width: `${receivedPercentage}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Upcoming Schedules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-3xl shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Upcoming Office Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {stats.recentActivity.upcomingOfficeTasks.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No upcoming office tasks.</p>
                ) : stats.recentActivity.upcomingOfficeTasks.map(task => (
                  <div key={task._id} className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex justify-between items-center group hover:bg-indigo-50 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{task.title}</p>
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">{task.project?.name || "General"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-500 font-mono">{formatDateForDisplay(task.endDate)}</p>
                      <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">{task.status}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Upcoming Site Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {stats.recentActivity.upcomingSiteTasks.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No upcoming site tasks.</p>
                ) : stats.recentActivity.upcomingSiteTasks.map(task => (
                  <div key={task._id} className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 flex justify-between items-center group hover:bg-orange-50 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-orange-700 transition-colors">{task.title}</p>
                      <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mt-1">{task.project?.name || "General"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-500 font-mono">{formatDateForDisplay(task.startDate)}</p>
                      <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">{task.status}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="space-y-6">
          <Card className="rounded-3xl shadow-sm border-slate-200 overflow-hidden h-full">
            <CardHeader className="bg-slate-900 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                  <Activity className="w-5 h-5 text-indigo-400" />
                </div>
                <CardTitle className="text-lg font-bold text-white">Live Activity Feed</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100 h-[600px] overflow-y-auto custom-scrollbar">
              {stats.recentActivity.siteUpdates.length === 0 && stats.recentActivity.messages.length === 0 && (
                 <div className="p-8 text-center text-slate-500 font-medium">No recent activity detected.</div>
              )}
              
              {/* Messages */}
              {stats.recentActivity.messages.map(msg => (
                <div key={msg._id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-bold text-slate-900">{msg.senderName || msg.senderEmail}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{formatDateForDisplay(msg.createdAt)}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Message Received</p>
                      <p className="text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm mt-2 line-clamp-3">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Site Updates */}
              {stats.recentActivity.siteUpdates.map(update => (
                <div key={update._id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                      <Construction className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-bold text-slate-900">{update.addedBy || "Site Engineer"}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{formatDateForDisplay(update.createdAt)}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Site Update: {update.project?.name}</p>
                      <p className="text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm mt-2">
                        {update.updateText}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
