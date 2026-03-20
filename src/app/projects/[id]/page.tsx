"use client";

import { projects, tasks, siteUpdates, workers, payments } from "@/lib/dummy-data";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ClipboardList, 
  Camera, 
  ChevronRight,
  Construction,
  CircleCheck,
  CircleDashed,
  CircleDot,
  Users,
  CreditCard,
  History,
  TrendingUp,
  DollarSign,
  AlertCircle,
  ArrowUpRight,
  Plus
} from "lucide-react";
import Link from "next/link";
import { useState, use } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { useProjects } from "@/lib/projects-store";

type Tab = "overview" | "tasks" | "workers" | "updates" | "photos" | "payments" | "timeline";

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const { getProjectById, updateStageStatus } = useProjects();
  const project = getProjectById(id);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (!project) return <div>Project not found</div>;

  const stages = project.stages;

  const canEdit = user?.role === "architect" || user?.role === "supervisor";

  const handleUpdateStageStatus = (stageName: string, newStatus: string) => {
    if (newStatus === "Pending" || newStatus === "In Progress" || newStatus === "Completed") {
      updateStageStatus(id, stageName, newStatus);
    }
  };

  const projectTasks = tasks.filter(t => t.project === project.name);
  const projectUpdates = siteUpdates.filter(u => u.project === project.name);
  const projectWorkers = workers.filter(w => w.assignedProjects.includes(project.name));
  const projectPayments = payments.filter(p => p.project === project.name);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="space-y-6">
          <Link 
            href="/projects" 
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors group uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Projects
          </Link>
          <div className="space-y-3">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">{project.name}</h2>
            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-500">
              <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <MapPin className="w-4 h-4 text-indigo-500" />
                {project.location}
              </span>
              <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <Calendar className="w-4 h-4 text-indigo-500" />
                {project.startDate}
              </span>
              <span className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
                {project.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-8 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95">
            Project Settings
          </button>
          <Link href="/site-updates"><Button className="gap-2">
            <Plus className="w-5 h-5" />
            Daily Log
          </Button></Link>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-x-auto scrollbar-hide sticky top-20 z-10">
        {[
          { id: "overview", label: "Overview", icon: Construction },
          { id: "tasks", label: "Tasks", icon: CheckCircle2 },
          { id: "workers", label: "Team", icon: Users },
          { id: "updates", label: "Logs", icon: ClipboardList },
          { id: "photos", label: "Photos", icon: Camera },
          { id: "payments", label: "Finances", icon: CreditCard },
          { id: "timeline", label: "Timeline", icon: History },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs font-bold transition-all duration-300 whitespace-nowrap",
              activeTab === tab.id 
                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" 
                : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[500px] animate-in fade-in slide-in-from-top-4 duration-500">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Construction roadmap</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-indigo-600 uppercase tracking-widest">{project.progress}% Complete</span>
                    <div className="w-40 h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-lg shadow-indigo-200" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                </div>

                <div className="relative pl-10 space-y-10">
                  <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-100" />
                  {stages.map((stage, idx) => (
                    <div key={idx} className="relative flex items-center gap-8 group">
                      <div className={cn(
                        "absolute -left-10 w-8 h-8 rounded-2xl border-4 border-white flex items-center justify-center z-10 transition-all duration-500 shadow-sm",
                        stage.status === "Completed" ? "bg-green-500 scale-110" :
                        stage.status === "In Progress" ? "bg-indigo-600 animate-pulse scale-110 shadow-lg shadow-indigo-100" :
                        "bg-slate-100"
                      )}>
                        {stage.status === "Completed" ? <CircleCheck className="w-4 h-4 text-white" /> :
                         stage.status === "In Progress" ? <CircleDot className="w-4 h-4 text-white" /> :
                         <CircleDashed className="w-4 h-4 text-slate-400" />}
                      </div>
                      <div className={cn(
                        "flex-1 p-6 rounded-[2rem] border transition-all duration-300",
                        stage.status === "Completed" ? "bg-green-50/20 border-green-100/30" :
                        stage.status === "In Progress" ? "bg-indigo-50/50 border-indigo-200 shadow-md" :
                        "bg-slate-50/30 border-slate-100 opacity-50 group-hover:opacity-100"
                      )}>
                        <div className="flex items-center justify-between">
                          <p className={cn(
                            "font-bold text-base tracking-tight",
                            stage.status === "Completed" ? "text-green-800" :
                            stage.status === "In Progress" ? "text-indigo-900" :
                            "text-slate-500"
                          )}>
                            {stage.name}
                          </p>
                          {canEdit ? (
                            <select
                              value={stage.status}
                              onChange={(e) => handleUpdateStageStatus(stage.name, e.target.value)}
                              className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500",
                                stage.status === "Completed" ? "bg-white text-green-600 border-green-100" :
                                stage.status === "In Progress" ? "bg-white text-indigo-600 border-indigo-100" :
                                "bg-white text-slate-400 border-slate-100"
                              )}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          ) : (
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm",
                              stage.status === "Completed" ? "bg-white text-green-600 border border-green-100" :
                              stage.status === "In Progress" ? "bg-white text-indigo-600 border border-indigo-100" :
                              "bg-white text-slate-400 border border-slate-100"
                            )}>
                              {stage.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Financial Health</h3>
                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Budget</p>
                    <p className="text-2xl font-black text-slate-900">{project.budget}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100">
                      <p className="text-[9px] font-bold text-green-600 uppercase tracking-widest mb-1">Received</p>
                      <p className="text-lg font-black text-green-700">{project.received}</p>
                    </div>
                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                      <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Pending</p>
                      <p className="text-lg font-black text-indigo-700">{project.pending}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-600 p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                <TrendingUp className="w-10 h-10 text-white/40" />
                <h3 className="text-xl font-bold text-white relative z-10 leading-tight">Project is ahead <br /> of schedule by 4 days</h3>
                <button className="px-6 py-2.5 bg-white text-indigo-600 rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-50 transition-all relative z-10">
                  View Timeline
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Task Details</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignee</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {projectTasks.map((task) => (
                  <tr key={task.id} className="group hover:bg-slate-50/30 transition-all">
                    <td className="px-10 py-8">
                      <p className="text-sm font-bold text-slate-900 mb-1">{task.name}</p>
                      <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-widest border border-indigo-100/50">{task.stage}</span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all duration-500 shadow-inner">
                          {task.worker.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{task.worker}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-sm font-bold text-slate-500">{task.deadline}</span>
                    </td>
                    <td className="px-10 py-8">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                        task.status === "In Progress" ? "bg-white text-blue-600 border-blue-100" :
                        task.status === "Completed" ? "bg-white text-green-600 border-green-100" :
                        "bg-white text-slate-400 border-slate-100"
                      )}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button className="text-slate-300 hover:text-indigo-600 p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all">
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "workers" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {projectWorkers.map((worker) => (
              <div key={worker.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6 hover:shadow-xl transition-all duration-500 group">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-2xl font-black text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-700 shadow-inner">
                    {worker.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <h4 className="text-lg font-bold text-slate-900 tracking-tight">{worker.name}</h4>
                  <p className="text-xs font-black text-indigo-500 uppercase tracking-widest">{worker.type}</p>
                </div>
                <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Rate</span>
                  <span className="text-sm font-black text-slate-900">{worker.rate}</span>
                </div>
                <button className="w-full py-3 bg-slate-50 text-slate-500 rounded-2xl text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100 uppercase tracking-widest">
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "updates" && (
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-12">
            {projectUpdates.map((update, idx) => (
              <div key={update.id} className="flex gap-10 group">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-700 shadow-sm">
                    <ClipboardList className="w-7 h-7 text-indigo-600 group-hover:text-white" />
                  </div>
                  {idx !== projectUpdates.length - 1 && <div className="w-px flex-1 bg-slate-100 my-4" />}
                </div>
                <div className="pb-12 border-b border-slate-50 last:border-0 last:pb-0 flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-slate-900 tracking-tight">{update.date}</p>
                    <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-indigo-100/50">
                      Supervisor log
                    </span>
                  </div>
                  <p className="text-slate-600 text-base leading-relaxed max-w-3xl font-medium">
                    {update.update}
                  </p>
                  <div className="flex items-center gap-6 pt-2">
                    <span className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                      <TrendingUp className="w-4 h-4" />
                      {update.progress}% Completed
                    </span>
                    <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Camera className="w-4 h-4" />
                      {update.photos} Site Photos
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-2">
                <div className="bg-green-50 p-3 rounded-2xl w-fit mb-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Received</p>
                <p className="text-3xl font-black text-slate-900">{project.received}</p>
              </div>
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-2">
                <div className="bg-orange-50 p-3 rounded-2xl w-fit mb-2">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Outstanding</p>
                <p className="text-3xl font-black text-slate-900">{project.pending}</p>
              </div>
              <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-xl shadow-indigo-100 flex items-center justify-between group cursor-pointer overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10 space-y-1">
                  <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">Next Milestone</p>
                  <p className="text-xl font-bold text-white tracking-tight">Structure Payment</p>
                  <p className="text-indigo-200 text-xs font-bold">Due in 12 days</p>
                </div>
                <ArrowUpRight className="w-10 h-10 text-white relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Milestone</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {projectPayments.map((payment) => (
                    <tr key={payment.id} className="group hover:bg-slate-50/30 transition-all">
                      <td className="px-10 py-8">
                        <p className="text-sm font-bold text-slate-900">{payment.milestone}</p>
                      </td>
                      <td className="px-10 py-8">
                        <p className="text-sm font-black text-slate-900">{payment.amount}</p>
                      </td>
                      <td className="px-10 py-8">
                        <span className="text-sm font-bold text-slate-500">{payment.date}</span>
                      </td>
                      <td className="px-10 py-8">
                        <span className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                          payment.status === "Paid" ? "bg-white text-green-600 border-green-100" : "bg-white text-orange-600 border-orange-100"
                        )}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <button className="text-indigo-600 hover:text-indigo-800 font-black text-xs uppercase tracking-widest">Download</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-12">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Full Project Schedule</h3>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-xs font-bold border border-slate-100">Export PDF</button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100">Add Milestone</button>
              </div>
            </div>

            <div className="space-y-12 relative pl-10">
              <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-100" />
              {[
                { date: "Jan 15, 2024", title: "Project Initiation & Design Finalization", status: "Completed" },
                { date: "Feb 01, 2024", title: "Site Excavation & Clearing", status: "Completed" },
                { date: "Feb 20, 2024", title: "Foundation & Plinth Work", status: "Completed" },
                { date: "Mar 10, 2024", title: "Structural Framing - Phase 1", status: "In Progress" },
                { date: "Apr 05, 2024", title: "Plumbing & Electrical Rough-in", status: "Planned" },
              ].map((item, idx) => (
                <div key={idx} className="relative flex gap-10 group">
                  <div className={cn(
                    "absolute -left-10 w-8 h-8 rounded-xl border-4 border-white flex items-center justify-center z-10 transition-all duration-500 shadow-sm",
                    item.status === "Completed" ? "bg-green-500" :
                    item.status === "In Progress" ? "bg-indigo-600" : "bg-slate-200"
                  )}>
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.date}</p>
                    <h4 className="text-base font-bold text-slate-900 tracking-tight">{item.title}</h4>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      item.status === "Completed" ? "text-green-600" :
                      item.status === "In Progress" ? "text-indigo-600" : "text-slate-400"
                    )}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "photos" && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Link href="/site-photos">
                <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Upload Photos
                </button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 group hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer relative overflow-hidden">
                  <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity" />
                  <Camera className="w-10 h-10 text-slate-300 group-hover:text-indigo-400 group-hover:scale-110 transition-all duration-500" />
                  <div className="text-center">
                    <p className="text-xs font-black text-slate-400 group-hover:text-indigo-600 uppercase tracking-widest">Site Photo #{i}</p>
                    <p className="text-[9px] font-bold text-slate-300 group-hover:text-indigo-400 uppercase tracking-widest mt-1">Mar 12, 2024</p>
                  </div>
                </div>
              ))}
              <Link href="/site-photos">
                <button className="aspect-square w-full bg-indigo-50 rounded-[2.5rem] border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center gap-4 group hover:bg-indigo-100 transition-all">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-indigo-600" />
                  </div>
                  <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Upload Photos</p>
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
