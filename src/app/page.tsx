"use client";

import { useAuth } from "@/lib/auth-context";
import { projects, tasks, siteUpdates, messages, payments } from "@/lib/dummy-data";
import { 
  Briefcase, 
  Construction, 
  Clock, 
  CreditCard,
  MessageSquare,
  HardHat,
  TrendingUp,
  ChevronRight, 
  Camera,
  Calendar,
  Plus,
  ArrowUpRight,
  CircleCheck,
  CircleAlert,
  MapPin,
  Users,
  Phone
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import DashboardCards from "@/components/DashboardCards";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case "architect":
      return <ArchitectDashboard />;
    case "client":
      return <ClientDashboard projectId={user.projectId} />;
    case "supervisor":
      return <SupervisorDashboard projectId={user.projectId} />;
    case "worker":
      return <WorkerDashboard projectId={user.projectId} />;
    default:
      return null;
  }
}

// --- Architect Dashboard ---
function ArchitectDashboard() {
  const todayTasks = tasks.slice(0, 3);
  
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Architect Console</h2>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-bold text-slate-700">Mar 14, 2026</span>
          </div>
        </div>
        <DashboardCards />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-2 p-10 space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-orange-50 p-3 rounded-2xl">
                <HardHat className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Live Site Schedule</h2>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Across All Projects</p>
              </div>
            </div>
            <Link href="/tasks">
              <Button variant="ghost" size="sm" className="text-indigo-600 gap-1 group">
                Full View
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {todayTasks.map((task) => (
              <div key={task.id} className="p-6 border border-slate-100 rounded-3xl hover:border-indigo-200 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <span className="px-2.5 py-1 bg-slate-50 text-[10px] font-bold text-slate-500 rounded-lg uppercase tracking-wider">{task.project}</span>
                  <StatusBadge status={task.status} />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors mb-4">{task.name}</h3>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-[10px] font-bold text-indigo-600">
                      {task.worker.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-xs font-bold text-slate-600">{task.worker}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{task.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-10 space-y-10">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-2xl">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Client Feed</h2>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Inbox</p>
            </div>
          </div>
          <div className="space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("p-5 rounded-3xl border transition-all", msg.unread ? "bg-indigo-50/50 border-indigo-100" : "bg-white border-slate-50 hover:bg-slate-50")}>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-xs font-bold text-indigo-600 shadow-sm border border-slate-100">
                    {msg.from.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{msg.from}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{msg.text}</p>
              </div>
            ))}
          </div>
          <Button variant="secondary" className="w-full text-xs uppercase tracking-widest">View All Messages</Button>
        </Card>
      </div>
    </div>
  );
}

// --- Client Dashboard ---
function ClientDashboard({ projectId }: { projectId?: string }) {
  const project = projects.find(p => p.id === projectId) || projects[0];
  const projectUpdates = siteUpdates.filter(u => u.project === project.name).slice(0, 2);
  
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{project.name}</h2>
          <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
            <span className="flex items-center gap-2"><Construction className="w-4 h-4 text-indigo-500" /> Site Progress</span>
            <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">{project.progress}% Complete</span>
          </div>
        </div>
        <Button className="gap-2">
          <MessageSquare className="w-5 h-5" />
          Contact Architect
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-2 p-10 space-y-10">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Construction Roadmap</h3>
          <div className="space-y-8 relative pl-10">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-100" />
            {project.stages.slice(0, 5).map((stage, idx) => (
              <div key={idx} className="relative flex items-center gap-6">
                <div className={cn(
                  "absolute -left-10 w-8 h-8 rounded-2xl border-4 border-white flex items-center justify-center z-10 shadow-sm",
                  stage.status === "Completed" ? "bg-green-500" :
                  stage.status === "In Progress" ? "bg-indigo-600 animate-pulse" : "bg-slate-100"
                )}>
                  {stage.status === "Completed" ? <CircleCheck className="w-4 h-4 text-white" /> : <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <div className={cn("flex-1 p-5 rounded-2xl border", stage.status === "In Progress" ? "bg-indigo-50/50 border-indigo-100" : "bg-white border-slate-50")}>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm text-slate-900">{stage.name}</p>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stage.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-8">
          <Card className="p-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Site Photos</h3>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200">
                  <Camera className="w-6 h-6 text-slate-300" />
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full text-xs">View Gallery</Button>
          </Card>

          <Card className="p-8 bg-indigo-600 text-white space-y-4">
            <h3 className="font-bold text-lg">Payment History</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-indigo-100">Total Budget</span>
                <span className="font-black">{project.budget}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-indigo-100">Received</span>
                <span className="font-black">{project.received}</span>
              </div>
            </div>
            <Button variant="white" className="w-full text-indigo-600">Download Statement</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

// --- Supervisor Dashboard ---
function SupervisorDashboard({ projectId }: { projectId?: string }) {
  const project = projects.find(p => p.id === projectId) || projects[0];
  const siteTasks = tasks.filter(t => t.project === project.name);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Site Console</h2>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">{project.name}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Users className="w-5 h-5" />
            Attendance
          </Button>
          <Button className="gap-2">
            <Plus className="w-5 h-5" />
            Daily Log
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-2 p-10 space-y-8">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Today's Site Tasks</h3>
          <div className="space-y-4">
            {siteTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white hover:border-indigo-100 transition-all group">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <HardHat className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{task.name}</p>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{task.worker}</p>
                  </div>
                </div>
                <Button variant="white" size="sm" className="text-indigo-600">Update Status</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-10 space-y-8">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Upload Progress</h3>
          <div className="aspect-video bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-indigo-50 transition-all">
            <Camera className="w-10 h-10 text-slate-300" />
            <p className="text-xs font-bold text-slate-400">Drag & drop site photos</p>
          </div>
          <div className="space-y-4 pt-4 border-t border-slate-50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Health</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">On Schedule</span>
              <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-100" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// --- Worker Dashboard ---
function WorkerDashboard({ projectId }: { projectId?: string }) {
  const project = projects.find(p => p.id === projectId) || projects[0];
  const myTasks = tasks.filter(t => t.worker === "John Doe");

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-2xl mx-auto pb-20">
      {/* Header with high contrast and big text */}
      <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-2xl shadow-indigo-100 border-4 border-white">
        <p className="text-indigo-100 font-black uppercase tracking-widest text-xs mb-2">Aapka Kaam (Today's Site)</p>
        <h2 className="text-4xl font-black tracking-tight leading-tight mb-4">{project.name}</h2>
        <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/20">
          <MapPin className="w-6 h-6 text-white" />
          <span className="text-lg font-bold">{project.location}</span>
        </div>
      </div>

      {/* Actionable Tasks */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-black text-slate-900">Aaj ke Kaam</h3>
          <span className="bg-slate-900 text-white px-4 py-2 rounded-2xl text-sm font-black">
            {myTasks.length} Kaam
          </span>
        </div>

        {myTasks.map(task => (
          <Card key={task.id} className="p-8 border-4 border-slate-100 shadow-xl space-y-8 rounded-[2.5rem] hover:border-indigo-600 transition-all active:scale-[0.98]">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h4 className="text-3xl font-black text-slate-900 leading-tight">{task.name}</h4>
                <div className="flex items-center gap-2 text-indigo-600 font-black text-lg">
                  <MapPin className="w-5 h-5" />
                  Floor 1, West Wing
                </div>
              </div>
              <div className={cn(
                "p-3 rounded-2xl border-2 font-black text-sm",
                task.status === "In Progress" ? "bg-blue-50 text-blue-600 border-blue-200" :
                task.status === "Completed" ? "bg-green-50 text-green-600 border-green-200" :
                "bg-slate-50 text-slate-400 border-slate-200"
              )}>
                {task.status === "In Progress" ? "Chalu hai" : task.status === "Completed" ? "Ho gaya" : "Baki hai"}
              </div>
            </div>

            {/* BIG ACTION BUTTONS FOR WORKERS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <Button 
                variant="outline" 
                className="h-24 rounded-[2rem] border-4 border-slate-200 gap-4 group/btn hover:bg-indigo-50 hover:border-indigo-600"
                onClick={() => alert("Kamera khul raha hai...")}
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                  <Camera className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="text-left">
                  <p className="font-black text-lg text-slate-900 leading-none">Photo Khecho</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Add Photo</p>
                </div>
              </Button>

              <Button 
                className="h-24 rounded-[2rem] bg-green-600 hover:bg-green-700 shadow-xl shadow-green-100 gap-4 group/done active:bg-green-800"
                onClick={() => alert("Kaam pura ho gaya!")}
              >
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <CircleCheck className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-black text-lg text-white leading-none">Kaam Ho Gaya</p>
                  <p className="text-xs font-bold text-green-100 uppercase tracking-widest mt-1">Mark Done</p>
                </div>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Emergency / Support Section */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex items-center justify-between shadow-2xl border-4 border-slate-800">
        <div className="space-y-1">
          <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Help Chahiye?</p>
          <p className="text-xl font-black">Supervisor ko Call Karein</p>
        </div>
        <Button 
          variant="white" 
          className="w-16 h-16 rounded-[1.5rem] p-0 shadow-lg active:scale-90 transition-transform"
          onClick={() => window.location.href = "tel:911"}
        >
          <Phone className="w-8 h-8 text-slate-900" />
        </Button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    "Pending": "bg-slate-100 text-slate-600 border-slate-200",
    "In Progress": "bg-blue-50 text-blue-600 border-blue-100",
    "Completed": "bg-green-50 text-green-600 border-green-100"
  };

  const icons = {
    "Pending": CircleAlert,
    "In Progress": Clock,
    "Completed": CircleCheck
  };

  const Icon = icons[status as keyof typeof icons] || CircleAlert;

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border uppercase tracking-wider shadow-sm",
      styles[status as keyof typeof styles]
    )}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}
