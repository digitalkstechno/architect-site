"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, User, Building2, MapPin, DollarSign, Calendar,
  CheckCircle2, ChevronRight, ClipboardList, HardHat, Users, Loader2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { supervisors, workers } from "@/lib/dummy-data";
import { useProjects } from "@/lib/projects-store";

type Step = "client" | "project" | "team" | "review";
const STEPS: Step[] = ["client", "project", "team", "review"];

export default function NewProjectPage() {
  const router = useRouter();
  const { createProject } = useProjects();
  const [step, setStep] = useState<Step>("client");
  const [clients, setClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [form, setForm] = useState({
    clientId: "", clientName: "", clientEmail: "", clientPhone: "",
    projectName: "", projectType: "Residential", location: "", budget: "",
    startDate: new Date().toISOString().split("T")[0], expectedCompletion: "",
    supervisorId: "", workerIds: [] as string[],
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/client`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const payload = await res.json();
        setClients(payload.clients || payload.data || []);
      } catch (err) {
        console.error("Fetch clients error:", err);
      } finally {
        setLoadingClients(false);
      }
    };
    fetchClients();
  }, []);

  const stepIndex = STEPS.indexOf(step);

  const next = () => setStep(STEPS[stepIndex + 1]);
  const prev = () => setStep(STEPS[stepIndex - 1]);

  const handleClientSelect = (id: string) => {
    const c = clients.find(c => c._id === id);
    if (c) setForm(f => ({ ...f, clientId: id, clientName: c.clientName, clientEmail: c.email, clientPhone: c.phone }));
  };

  const toggleWorker = (id: string) => {
    setForm(f => ({
      ...f,
      workerIds: f.workerIds.includes(id) ? f.workerIds.filter(w => w !== id) : [...f.workerIds, id],
    }));
  };

  const defaultStages = [
    "Layout", "Excavation", "Foundation", "Structure", "Brick Work",
    "Plumbing", "Electrical", "Plaster", "Flooring", "Painting", "Interior", "Final Handover",
  ].map(name => ({ name, status: "Pending" as const }));

  const defaultLifecycle = [
    { name: "Pre-Design", status: "In Progress" as const },
    { name: "Schematic Design", status: "Pending" as const },
    { name: "Design Development", status: "Pending" as const },
    { name: "Construction Documents", status: "Pending" as const },
    { name: "Bidding", status: "Pending" as const },
    { name: "Construction Administration", status: "Pending" as const },
  ];

  const handleSubmit = async () => {
    const budgetStr = form.budget?.trim() ? `$${form.budget.replace(/^\$/, "")}` : "$0";
    try {
      const created = await createProject({
        name: form.projectName || "Untitled Project",
        client: form.clientName || "Unknown Client",
        clientId: form.clientId || undefined,
        location: form.location || "—",
        startDate: form.startDate,
        expectedCompletion: form.expectedCompletion || "—",
        budget: budgetStr,
        supervisorId: form.supervisorId || undefined,
        workerIds: form.workerIds,
        lifecycle: defaultLifecycle,
        stages: defaultStages,
      });
      router.push(`/projects/${created.id}`);
    } catch (err) {
      console.error("Create project error:", err);
      alert("Failed to create project. Please check if all required fields (Client) are filled.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors group uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Dashboard
        </Link>
        {/* Step indicators */}
        <div className="flex items-center gap-2">
          {[
            { id: "client", label: "Client" },
            { id: "project", label: "Project" },
            { id: "team", label: "Team" },
            { id: "review", label: "Review" },
          ].map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all border-2",
                step === s.id ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" :
                i < stepIndex ? "bg-green-500 border-green-500 text-white" :
                "bg-white border-slate-200 text-slate-400"
              )}>
                {i < stepIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              {i < 3 && <div className="w-8 h-0.5 bg-slate-100 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Onboard New Project</h1>
        <p className="text-slate-500 font-medium mt-2">Set up a new project from lead to live — step by step.</p>
      </div>

      {/* Step 1: Client */}
      {step === "client" && (
        <Card className="p-10 space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
            <div className="bg-indigo-50 p-3 rounded-2xl"><User className="w-6 h-6 text-indigo-600" /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 1: Client</h2>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Select or enter client details</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Existing Clients</p>
            {loadingClients ? (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Loading...</span>
              </div>
            ) : clients.length === 0 ? (
              <p className="text-xs text-slate-400">No clients found. Add one below.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {clients.map(c => (
                  <button key={c._id} type="button" onClick={() => handleClientSelect(c._id)}
                    className={cn(
                      "p-4 rounded-2xl border-2 text-left transition-all",
                      form.clientId === c._id ? "bg-indigo-50 border-indigo-400" : "bg-white border-slate-100 hover:border-slate-300"
                    )}>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black mb-3",
                      form.clientId === c._id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600")}>
                      {(c.clientName || "").split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <p className="text-sm font-bold text-slate-900">{c.clientName}</p>
                    <p className="text-xs text-slate-400 truncate">{c.email}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Or Enter New Client</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                <Input placeholder="e.g., Ratan Tata" value={form.clientName}
                  onChange={e => setForm(f => ({ ...f, clientName: e.target.value, clientId: "" }))} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                <Input type="email" placeholder="client@email.com" value={form.clientEmail}
                  onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                <Input placeholder="+91 98765 43210" value={form.clientPhone}
                  onChange={e => setForm(f => ({ ...f, clientPhone: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={next} className="gap-2 px-10" disabled={!form.clientName}>
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Project */}
      {step === "project" && (
        <Card className="p-10 space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
            <div className="bg-orange-50 p-3 rounded-2xl"><Building2 className="w-6 h-6 text-orange-600" /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 2: Project Details</h2>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Scope, site, and financials</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Name *</label>
              <Input placeholder="e.g., Sharma Residence" value={form.projectName}
                onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Type</label>
              <select className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.projectType} onChange={e => setForm(f => ({ ...f, projectType: e.target.value }))}>
                <option>Residential</option>
                <option>Commercial</option>
                <option>Industrial</option>
                <option>Interior Design</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input className="pl-12" placeholder="City, State" value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget (Approx)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input className="pl-12" placeholder="e.g., 2,500,000" value={form.budget}
                  onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input className="pl-12" type="date" value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected Completion</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input className="pl-12" type="date" value={form.expectedCompletion}
                  onChange={e => setForm(f => ({ ...f, expectedCompletion: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button variant="ghost" onClick={prev} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <Button onClick={next} className="gap-2 px-10" disabled={!form.projectName}>
              Assign Team <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Team */}
      {step === "team" && (
        <Card className="p-10 space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
            <div className="bg-green-50 p-3 rounded-2xl"><Users className="w-6 h-6 text-green-600" /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 3: Assign Team</h2>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Select supervisor and site workers</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <HardHat className="w-3 h-3" /> Site Supervisor
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {supervisors.map(s => (
                <button key={s.id} type="button"
                  onClick={() => setForm(f => ({ ...f, supervisorId: f.supervisorId === s.id ? "" : s.id }))}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all",
                    form.supervisorId === s.id ? "bg-indigo-50 border-indigo-400" : "bg-white border-slate-100 hover:border-slate-200"
                  )}>
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0",
                    form.supervisorId === s.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600")}>
                    {s.name.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.experience}</p>
                  </div>
                  {form.supervisorId === s.id && <CheckCircle2 className="w-4 h-4 text-indigo-600 ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-3 h-3" /> Workers
              {form.workerIds.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded-full">
                  {form.workerIds.length} selected
                </span>
              )}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {workers.map(w => {
                const selected = form.workerIds.includes(w.id);
                return (
                  <button key={w.id} type="button" onClick={() => toggleWorker(w.id)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all",
                      selected ? "bg-indigo-50 border-indigo-400" : "bg-white border-slate-100 hover:border-slate-200"
                    )}>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0",
                      selected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600")}>
                      {w.name.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{w.name}</p>
                      <p className="text-xs text-indigo-600 font-bold">{w.type}</p>
                      <p className="text-[10px] text-slate-400">{w.rate}</p>
                    </div>
                    {selected && <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button variant="ghost" onClick={prev} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
            <Button onClick={next} className="gap-2 px-10">
              Review <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Review */}
      {step === "review" && (
        <Card className="p-0 overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="bg-slate-900 p-10 text-white">
            <h2 className="text-2xl font-bold">Review & Launch</h2>
            <p className="text-slate-400 text-sm mt-1">Verify all details before creating the project.</p>
          </div>
          <div className="p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2 flex items-center gap-2">
                  <User className="w-3 h-3" /> Client
                </h3>
                <p className="font-bold text-slate-900">{form.clientName || "—"}</p>
                <p className="text-sm text-slate-500">{form.clientEmail}</p>
                <p className="text-sm text-slate-500">{form.clientPhone}</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-widest border-b border-orange-50 pb-2 flex items-center gap-2">
                  <Building2 className="w-3 h-3" /> Project
                </h3>
                <p className="font-bold text-slate-900">{form.projectName || "Untitled"}</p>
                <p className="text-sm text-slate-500">{form.projectType} · {form.location}</p>
                <p className="text-sm font-bold text-indigo-600">${form.budget}</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-green-600 uppercase tracking-widest border-b border-green-50 pb-2 flex items-center gap-2">
                  <Users className="w-3 h-3" /> Team
                </h3>
                <p className="text-sm font-bold text-slate-900">
                  {supervisors.find(s => s.id === form.supervisorId)?.name || "No Supervisor"}
                </p>
                <p className="text-sm text-slate-500">{form.workerIds.length} worker(s) assigned</p>
              </div>
            </div>

            <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-start gap-4">
              <ClipboardList className="w-6 h-6 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-indigo-900">Project Initialization</p>
                <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                  This project will be created in the <b>Pre-Design</b> lifecycle phase. You can assign  
                  tasks, upload documents, and log site updates immediately after.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={prev} className="gap-2"><ArrowLeft className="w-4 h-4" /> Edit Details</Button>
              <Button onClick={handleSubmit} className="gap-2 px-10 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100">
                <CheckCircle2 className="w-5 h-5" /> Launch Project
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
