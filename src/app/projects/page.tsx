"use client";

import { useAuth } from "@/lib/auth-context";
import { API_BASE_URL } from "@/lib/api-config";
import { supervisors, workers, clients, WORKER_SPECIALIZATIONS } from "@/lib/dummy-data";
import {
  MoreHorizontal, MapPin, Calendar, ChevronRight, Plus, ArrowUpRight,
  LayoutGrid, List, Search, X, HardHat, Users, CheckCircle2, Trash2, Edit2, Layers
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { useProjects } from "@/lib/projects-store";

import { ProjectStage, StageStatus } from "@/lib/projects-store";

const defaultStages: ProjectStage[] = [
  "Layout", "Excavation", "Foundation", "Structure", "Brick Work",
  "Plumbing", "Electrical", "Plaster", "Flooring", "Painting", "Interior", "Final Handover",
].map(name => ({ name, status: "Pending" as StageStatus }));

const emptyForm = {
  name: "", client: "", clientId: "", location: "",
  startDate: "", expectedCompletion: "", budget: "",
  supervisorId: "", workerIds: [] as string[],
};

export default function ProjectsPage() {
  const { user } = useAuth();
  const { projects, createProject, updateProject, deleteProject, isHydrated } = useProjects();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [specFilter, setSpecFilter] = useState("");
  const [clientsList, setClientsList] = useState<any[]>([]);

  useMemo(() => {
    if (!isAddModalOpen) return;
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/client`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const payload = await res.json();
        setClientsList(payload.clients || payload.data || []);
      } catch (err) {
        console.error("Fetch clients error:", err);
      }
    };
    fetchClients();
  }, [isAddModalOpen]);

  const filteredProjects = projects.filter(p => {
    const match = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client.toLowerCase().includes(searchQuery.toLowerCase());
    if (user?.role && typeof user.role !== "string" && (user.role as any).tenantId) {
       // Filtered by store fetch already, but extra safety
    }
    return match;
  });

  const roleNameStr = typeof user?.role === "object" ? (user.role as any).roleName : (user?.role || "");
  const isClientRole = roleNameStr.toLowerCase().includes("client");

  const canAdd = user?.role && (
    typeof user.role === "string" 
      ? user.role === "architect" || user.role === "TENANT_ADMIN"
      : (user.role as any).roleName?.toLowerCase().includes("architect") ||
        (user.role as any).roleName === "TENANT_ADMIN" ||
        (user.role as any).permissions?.some((p: any) => p.module === "PROJECT" && p.actions.includes("CREATE"))
  );

  const getSupervisorName = (id?: string) =>
    supervisors.find(s => s.id === id)?.name || "—";

  const filteredWorkersForForm = workers.filter(w =>
    specFilter === "" || w.specializations.some(s => s.toLowerCase().includes(specFilter.toLowerCase())) ||
    w.name.toLowerCase().includes(specFilter.toLowerCase())
  );

  const toggleWorker = (id: string) => {
    setForm(f => ({
      ...f,
      workerIds: f.workerIds.includes(id)
        ? f.workerIds.filter(w => w !== id)
        : [...f.workerIds, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const clientObj = clients.find(c => c.id === form.clientId);
    try {
      await createProject({
        name: form.name,
        client: clientObj?.name || form.client,
        clientId: form.clientId,
        location: form.location,
        startDate: form.startDate,
        expectedCompletion: form.expectedCompletion,
        budget: form.budget,
        supervisorId: form.supervisorId,
        workerIds: form.workerIds,
        stages: defaultStages,
      });
      setForm(emptyForm);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Create project error:", err);
      alert("Failed to create project. Make sure a client is selected.");
    }
  };

  return (
    <>
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isClientRole ? "My Project" : "Project Portfolio"}
            </h2>
            <p className="text-sm font-medium text-slate-500 hidden sm:block">
              {isClientRole ? "Track your construction progress" : "Manage and track active construction sites"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {!isClientRole && (
              <div className="hidden md:block">
                <Input placeholder="Search projects..." icon={Search} className="w-64"
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
            )}
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm h-[46px]">
              <Button variant={view === "grid" ? "white" : "ghost"} size="icon" onClick={() => setView("grid")}
                className={cn("p-2 rounded-lg", view === "grid" ? "text-indigo-600 shadow-sm" : "text-slate-400")}>
                <LayoutGrid className="w-5 h-5" />
              </Button>
              <Button variant={view === "list" ? "white" : "ghost"} size="icon" onClick={() => setView("list")}
                className={cn("p-2 rounded-lg", view === "list" ? "text-indigo-600 shadow-sm" : "text-slate-400")}>
                <List className="w-5 h-5" />
              </Button>
            </div>
            {canAdd && (
              <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Project</span>
              </Button>
            )}
          </div>
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map(project => (
              <Card key={project.id} className="overflow-hidden group">
                <div className="p-8 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-sm font-medium text-slate-500">Client: {project.client}</p>
                    </div>
                    {canAdd && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => deleteProject(project.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{project.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">Started {project.startDate}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <HardHat className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">
                        {getSupervisorName(project.supervisorId)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{project.workerIds?.length || 0} Workers</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="text-slate-900">Progress</span>
                      <span className="text-indigo-600">{project.progress}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                        style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                </div>

                <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2.5 h-2.5 rounded-full",
                      project.status === "In Progress" ? "bg-green-500 animate-pulse" : "bg-blue-500")} />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{project.status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link href={`/project-stages?projectId=${project.id}`}
                      className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors group/btn">
                      Stages
                      <Layers className="w-4 h-4" />
                    </Link>
                    <Link href={`/projects/${project.id}`}
                      className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors group/btn">
                      Details
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map(project => (
                  <TableRow key={project.id} className="group">
                    <TableCell>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{project.name}</p>
                        <p className="text-xs font-medium text-slate-500">{project.client}</p>
                      </div>
                    </TableCell>
                    <TableCell><span className="text-sm font-medium text-slate-600">{project.location}</span></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-100">
                          {getSupervisorName(project.supervisorId).split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{getSupervisorName(project.supervisorId)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full",
                          project.status === "In Progress" ? "bg-green-500" : "bg-blue-500")} />
                        <span className="text-xs font-bold text-slate-700">{project.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600" style={{ width: `${project.progress}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-900">{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/project-stages?projectId=${project.id}`}
                          className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700">
                          Stages <Layers className="w-4 h-4" />
                        </Link>
                        <Link href={`/projects/${project.id}`}
                          className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700">
                          View <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {/* Create Project Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}
        title="Create New Project" className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Project Name *</label>
              <Input placeholder="e.g., Modern Villa" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Client *</label>
              <select value={form.clientId}
                onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                <option value="">Select a client</option>
                {clientsList.map(c => (
                  <option key={c._id} value={c._id}>{c.clientName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Location</label>
            <Input placeholder="e.g., Beverly Hills, CA" value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Start Date</label>
              <Input type="date" value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Expected Completion</label>
              <Input type="date" value={form.expectedCompletion}
                onChange={e => setForm(f => ({ ...f, expectedCompletion: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Budget</label>
              <Input placeholder="e.g., $850,000" value={form.budget}
                onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
            </div>
          </div>

          {/* Supervisor Assign */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
              <HardHat className="w-4 h-4 text-indigo-600" /> Assign Supervisor
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {supervisors.map(sup => (
                <button key={sup.id} type="button"
                  onClick={() => setForm(f => ({ ...f, supervisorId: f.supervisorId === sup.id ? "" : sup.id }))}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                    form.supervisorId === sup.id
                      ? "bg-indigo-50 border-indigo-400"
                      : "bg-white border-slate-100 hover:border-slate-300"
                  )}>
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all",
                    form.supervisorId === sup.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600")}>
                    {sup.name.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{sup.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{sup.experience}</p>
                  </div>
                  {form.supervisorId === sup.id && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 ml-auto flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Workers Assign */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Assign Workers
              {form.workerIds.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded-full">
                  {form.workerIds.length} selected
                </span>
              )}
            </label>
            <Input placeholder="Filter by name or specialization..."
              value={specFilter} onChange={e => setSpecFilter(e.target.value)} icon={Search} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-1">
              {filteredWorkersForForm.map(w => {
                const selected = form.workerIds.includes(w.id);
                return (
                  <button key={w.id} type="button" onClick={() => toggleWorker(w.id)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                      selected ? "bg-indigo-50 border-indigo-400" : "bg-white border-slate-100 hover:border-slate-300"
                    )}>
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 transition-all",
                      selected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600")}>
                      {w.name.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{w.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {w.specializations.map(s => (
                          <span key={s} className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 uppercase tracking-wider">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    {selected && <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => { setIsAddModalOpen(false); setForm(emptyForm); }}>
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
