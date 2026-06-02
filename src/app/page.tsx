"use client";

import { useAuth } from "@/lib/auth-context";
import { useProjects } from "@/lib/projects-store";
import { useTasks } from "@/lib/tasks-store";
import { useSiteUpdates } from "@/lib/site-updates-store";
import { usePayments } from "@/lib/payments-store";
import {
  Briefcase,
  Construction,
  Clock,
  CreditCard,
  MessageSquare,
  HardHat,
  ChevronRight,
  Camera,
  Calendar,
  CircleCheck,
  CircleAlert,
  MapPin,
  Phone,
  Users,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatsCard } from "@/components/ui/StatsCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import DashboardCards from "@/components/DashboardCards";

export default function Dashboard() {
  const { user } = useAuth();
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { updates: siteUpdates } = useSiteUpdates();

  if (!user) return null;

  switch (user.role) {
    case "director":
    case "architect":
      return <ArchitectDashboard role={user.role} />;
    case "office-team":
      return <OfficeTeamDashboard />;
    case "site-engineer":
      return <SiteEngineerDashboard />;
    case "supervisor":
      return <SupervisorDashboard projectId={user.projectId} />;
    case "accountant":
      return <AccountantDashboard />;
    case "client":
      return <ClientDashboard projectId={user.projectId} />;
    case "guest":
    default:
      return <ArchitectDashboard />;
  }
}

// --- Architect Dashboard ---
function ArchitectDashboard({ role = "architect" }: { role?: string }) {
  const { tasks } = useTasks();
  const todayTasks = tasks.slice(0, 3);
  const messages: { id: string; from: string; text: string; date: string; unread: boolean }[] = [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title={role === "director" ? "Director Console" : "Architect Console"}
        description="Monitor projects, tasks, and team performance across all sites."
      >
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded border border-slate-200 shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-xs font-medium text-slate-700 font-mono">May 22, 2026</span>
        </div>
      </PageHeader>


      <DashboardCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <HardHat className="w-4 h-4 text-slate-600" />
              </div>
              <CardTitle className="font-medium">Live Site Schedule</CardTitle>
            </div>
            <Link href="/tasks">
              <Button variant="ghost" size="sm" className="text-primary-600 font-medium gap-1">
                View all tasks
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todayTasks.map((task) => (
                <div key={task.id} className="p-4 border border-slate-200 rounded-md hover:border-primary-200 transition-all group bg-white shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{task.project}</span>
                    <DashboardStatusBadge status={task.officeStatus} className="text-[10px] px-2 py-0" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-900 group-hover:text-primary-600 transition-colors mb-3">{task.name}</h3>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary-50 rounded flex items-center justify-center text-[9px] font-medium text-primary-600 border border-primary-100">
                        {(task.officeTeam || "").split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <span className="text-xs font-medium text-slate-600">{task.officeTeam || "—"}</span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 font-mono">{task.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <MessageSquare className="w-4 h-4 text-slate-600" />
              </div>
              <CardTitle>Client Feed</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {messages.slice(0, 3).map((msg) => (
              <div key={msg.id} className={cn("p-4 rounded border transition-all", msg.unread ? "bg-primary-50/30 border-primary-100" : "bg-white border-slate-100 hover:bg-slate-50")}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-primary-600 border border-slate-200">
                    {msg.from.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">{msg.from}</h3>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2 font-medium">{msg.text}</p>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="secondary" className="w-full text-xs font-bold py-2">View all messages</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// --- Client Dashboard ---
function ClientDashboard({ projectId }: { projectId?: string }) {
  const { projects } = useProjects();
  const project = projects.find(p => p.id === projectId) || projects[0];

  if (!project) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-medium text-slate-900 tracking-tight">{project.name}</h2>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5"><Construction className="w-3.5 h-3.5 text-primary-500" /> Site Progress</span>
              <span className="text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded border border-primary-100 font-mono">{project.progress}% Complete</span>
            </div>
          </div>
          <Button variant="primary" className="gap-2 h-10 px-6 font-medium">
            <MessageSquare className="w-4 h-4" />
            Contact Architect
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-medium">Construction Roadmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 relative pl-8">
              <div className="absolute left-3.5 top-1 bottom-1 w-0.5 bg-slate-100" />
              {project.stages.slice(0, 5).map((stage, idx) => (
                <div key={idx} className="relative flex items-center gap-4">
                  <div className={cn(
                    "absolute -left-8 w-7 h-7 rounded border-2 border-white flex items-center justify-center z-10 shadow-sm",
                    stage.status === "Completed" ? "bg-emerald-500" :
                      stage.status === "In Progress" ? "bg-primary-600 animate-pulse" : "bg-slate-100"
                  )}>
                    {stage.status === "Completed" ? <CircleCheck className="w-3.5 h-3.5 text-white" /> : <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <p className={cn("text-sm font-medium", stage.status === "Pending" ? "text-slate-400" : "text-slate-900")}>{stage.name}</p>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{stage.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-medium">Project Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Financial Summary</p>
              <div className="p-4 bg-slate-50 rounded border border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Total Budget</span>
                  <span className="text-sm font-medium text-slate-900 font-mono">{project.budget}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Received</span>
                  <span className="text-sm font-medium text-emerald-600 font-mono">{project.received}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-700">Pending</span>
                  <span className="text-sm font-medium text-red-600 font-mono">{project.pending}</span>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full text-xs font-medium gap-2">
              <CreditCard className="w-4 h-4" />
              Make Payment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Office Team Dashboard ---
function OfficeTeamDashboard() {
  const messages: { id: string; from: string; text: string; date: string; unread: boolean }[] = [];
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Office Team Console"
        description="Manage communications, documentation, and office-site coordination."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard label="Unread Messages" value="12" icon={MessageSquare} />
        <StatsCard label="Pending Docs" value="8" icon={Briefcase} />
        <StatsCard label="Site Updates" value="24" icon={Construction} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {messages.slice(0, 5).map((msg) => (
              <div key={msg.id} className="p-4 rounded border border-slate-100 hover:bg-slate-50 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">{msg.from}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{msg.date}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-1">{msg.text}</p>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full text-xs font-bold">Go to Messages</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Office Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              "Review site expenses for Modern Villa",
              "Update client meeting schedule",
              "File GST reports for Q1",
              "Follow up with structural engineer"
            ].map((task, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-100">
                <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                <span className="text-sm font-medium text-slate-700">{task}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Site Engineer Dashboard ---
function SiteEngineerDashboard() {
  const { updates: siteUpdates } = useSiteUpdates();
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Site Engineer Console"
        description="Technical oversight and site progress management."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Active Sites" value="4" icon={MapPin} />
        <StatsCard label="Safety Checks" value="Pass" icon={CircleCheck} className="border-emerald-100" />
        <StatsCard label="Material Status" value="On Track" icon={Briefcase} />
        <StatsCard label="Next Milestone" value="3 Days" icon={Clock} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Technical Site Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {siteUpdates.slice(0, 4).map(update => (
              <div key={update.id} className="p-4 border border-slate-200 rounded-xl hover:border-indigo-200 transition-all bg-white shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{update.project}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{update.date}</span>
                </div>
                <p className="text-sm font-medium text-slate-800 mb-3">{update.update}</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold">
                    {(update.addedBy || "S")[0]}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Engineer: {update.addedBy || "Site Team"}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Engineering Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button className="w-full h-12 gap-2 font-bold uppercase tracking-wider text-xs bg-indigo-600">
              <Plus className="w-4 h-4" /> New Site Report
            </Button>
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Logs</p>
              {["Foundation Check", "Slab Reinforcement", "Column Casting"].map((log, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{log}</span>
                  <StatusBadge status="Completed" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Supervisor Dashboard ---
function SupervisorDashboard({ projectId }: { projectId?: string }) {
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const project = projects.find(p => p.id === projectId) || projects[0];

  if (!project) return null;

  const siteTasks = tasks.filter(t => t.project === project.name).slice(0, 4);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title={project.name}
        description={`${project.location} • Supervisor View`}
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 font-bold text-xs">
            <Camera className="w-4 h-4" />
            Add Site Photo
          </Button>
          <Button variant="primary" size="sm" className="gap-2 font-bold text-xs bg-indigo-600">
            <Plus className="w-4 h-4" />
            New Update
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-bold">Active Site Tasks</CardTitle>
            <Link href="/tasks">
              <Button variant="ghost" size="sm" className="text-indigo-600 font-bold gap-1">
                Manage all
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {siteTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-200 transition-all group shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                    <HardHat className="w-5 h-5 text-slate-600 group-hover:text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{task.name}</p>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{task.siteTeam}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DashboardStatusBadge status={task.siteStatus} className="text-[10px] px-2 py-0" />
                  <Link href="/tasks">
                    <Button variant="outline" size="sm" className="text-[10px] font-bold h-7 px-3 rounded-lg">Update</Button>
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 space-y-6 rounded-[2rem]">
            <CardTitle className="font-bold">Quick Actions</CardTitle>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" className="flex-col h-24 gap-2 font-bold text-[10px] uppercase tracking-wider rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                <Users className="w-6 h-6" />
                Attendance
              </Button>
              <Button variant="secondary" className="flex-col h-24 gap-2 font-bold text-[10px] uppercase tracking-wider rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                <MapPin className="w-6 h-6" />
                Site Log
              </Button>
            </div>
          </Card>

          <Card className="p-6 rounded-[2rem]">
            <CardTitle className="mb-4 text-xs uppercase tracking-widest text-slate-500 font-bold">Project Health</CardTitle>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">On Schedule</span>
                <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-200" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  <span>Overall Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                  <div className="h-full bg-indigo-600 shadow-sm" style={{ width: `${project.progress}%` }} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// --- Worker Dashboard ---
function WorkerDashboard({ projectId }: { projectId?: string }) {
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const project = projects.find(p => p.id === projectId) || projects[0];

  if (!project) return null;

  const myTasks = tasks.filter(t => t.siteTeam === "John Doe");

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto pb-10">
      <div className="bg-primary-900 p-8 rounded-lg text-white shadow-lg border border-primary-800">
        <p className="text-primary-300 font-medium uppercase tracking-[0.2em] text-[10px] mb-2">Today's Site Assignment</p>
        <h2 className="text-3xl font-medium tracking-tight mb-4">{project.name}</h2>
        <div className="flex items-center gap-2 text-primary-200 text-sm font-medium">
          <MapPin className="w-4 h-4" />
          {project.location}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-medium text-slate-900 tracking-tight">Daily Tasks</h3>
          <div className="px-3 py-1 font-medium bg-slate-100 rounded text-slate-600 text-xs font-mono">
            {myTasks.length} Assigned
          </div>
        </div>

        {myTasks.map(task => (
          <Card key={task.id} className="p-6 hover:border-primary-300 transition-all bg-white shadow-sm border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-lg font-medium text-slate-900">{task.name}</h4>
                <div className="flex items-center gap-2 text-primary-600 font-medium text-xs uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  Site Area A-4
                </div>
              </div>
              <DashboardStatusBadge status={task.siteStatus} className="w-fit" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-100">
              <Button
                variant="outline"
                className="h-12 gap-2 font-medium text-xs uppercase tracking-wider"
                onClick={() => window.location.href = "/site-photos"}
              >
                <Camera className="w-4 h-4 text-primary-600" />
                Upload Photo
              </Button>

              <Button
                variant="primary"
                className="h-12 gap-2 font-medium text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                onClick={() => window.location.href = "/tasks"}
              >
                <CircleCheck className="w-4 h-4" />
                Mark as Done
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-slate-900 p-6 rounded-lg text-white flex items-center justify-between border border-slate-800 shadow-lg">
        <div className="space-y-0.5">
          <p className="text-slate-500 font-medium text-[10px] uppercase tracking-widest">Need Support?</p>
          <p className="text-base font-medium">Contact Site Supervisor</p>
        </div>
        <Button
          variant="secondary"
          className="w-10 h-10 p-0 rounded bg-white/10 hover:bg-white/20 border-white/10"
          onClick={() => window.location.href = "tel:911"}
        >
          <Phone className="w-4 h-4 text-white" />
        </Button>
      </div>
    </div>
  );
}

// --- Accountant Dashboard ---
function AccountantDashboard() {
  const { payments } = usePayments();
  const totalBudget = payments.reduce((sum, p) => {
    const amount = typeof p.amount === 'number' ? p.amount : parseFloat(String(p.amount).replace(/[₹$,]/g, "")) || 0;
    return sum + amount;
  }, 0);
  const paid = payments.filter(p => p.status === "Paid").reduce((sum, p) => {
    const amount = typeof p.amount === 'number' ? p.amount : parseFloat(String(p.amount).replace(/[₹$,]/g, "")) || 0;
    return sum + amount;
  }, 0);
  const pending = payments.filter(p => p.status === "Pending").reduce((sum, p) => {
    const amount = typeof p.amount === 'number' ? p.amount : parseFloat(String(p.amount).replace(/[₹$,]/g, "")) || 0;
    return sum + amount;
  }, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Financial Console"
        description="Monitor payments, project budgets, and receivables."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard label="Total Budget" value={`₹${totalBudget.toLocaleString()}`} icon={CreditCard} />
        <StatsCard label="Received" value={`₹${paid.toLocaleString()}`} icon={CircleCheck} className="border-emerald-100" />
        <StatsCard label="Pending" value={`₹${pending.toLocaleString()}`} icon={Clock} className="border-amber-100" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-medium">Recent Transactions</CardTitle>
          <Button variant="outline" size="sm" className="font-medium text-xs uppercase tracking-wider">Export PDF</Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="pro-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Milestone</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="group">
                    <td><span className="font-medium">{p.project}</span></td>
                    <td>{p.client}</td>
                    <td>{p.milestone}</td>
                    <td><span className="font-medium text-slate-900 font-mono">{p.amount}</span></td>
                    <td><DashboardStatusBadge status={p.status} className="text-[10px] px-2 py-0" /></td>
                    <td><span className="text-slate-500 font-medium font-mono">{p.date}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardStatusBadge({ status, className }: { status: string | undefined, className?: string }) {
  const safeStatus = status || "Pending";
  const styles = {
    "Pending": "bg-slate-100 text-slate-600 border-slate-200",
    "In Progress": "bg-blue-50 text-blue-600 border-blue-100",
    "Completed": "bg-green-50 text-green-600 border-green-100",
    "Paid": "bg-green-50 text-green-600 border-green-100"
  };

  const icons = {
    "Pending": CircleAlert,
    "In Progress": Clock,
    "Completed": CircleCheck,
    "Paid": CircleCheck
  };

  const Icon = icons[safeStatus as keyof typeof icons] || CircleAlert;

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-[10px] font-medium flex items-center gap-1.5 border uppercase tracking-wider shadow-sm",
      styles[safeStatus as keyof typeof styles],
      className
    )}>
      <Icon className="w-3.5 h-3.5" />
      {safeStatus}
    </span>
  );
}

