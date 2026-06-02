"use client";

import { useAuth } from "@/lib/auth-context";
import { useProjects } from "@/lib/projects-store";
import { staffService, StaffMember } from "@/services/staff.service";
import { projectService } from "@/services/project.service";
import {
  MapPin, ChevronRight, Plus, Search, HardHat, CheckCircle2, UserCircle2, Edit2, Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { DataTable, Column } from "@/components/ui/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import toast from "react-hot-toast";

type Project = ReturnType<typeof useProjects>["projects"][0];

const defaultStages = [
  "Layout", "Excavation", "Foundation", "Structure", "Brick Work",
  "Plumbing", "Electrical", "Plaster", "Flooring", "Painting", "Interior", "Final Handover",
].map(name => ({ name, status: "Pending" as const }));

const emptyForm = {
  name: "", clientId: "", location: "",
  startDate: "", expectedCompletion: "", budget: "",
  designerId: "",
};

export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { projects, createProject, updateProject, deleteProject, fetchProjects } = useProjects() as any;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (isAddModalOpen) {
        setIsLoadingData(true);
        try {
          const staffData = await staffService.getAllStaff();
          setStaff(staffData);
        } catch (error) {
          console.error("Error loading modal data:", error);
        } finally {
          setIsLoadingData(false);
        }
      }
    };
    loadData();
  }, [isAddModalOpen]);

  // Staff with "client" role
  const clientStaff = staff.filter(s =>
    s.role?.name?.toLowerCase() === "client"
  );

  // Staff with designer/architect/director roles
  const designers = staff.filter(s => {
    const rn = s.role?.name?.toLowerCase() ?? "";
    return rn === "designer";
  });

  const filteredProjects = projects.filter((p: any) => {
    const searchQueryMatch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Role based filtering
    if (user?.role === "director" || user?.role === "architect" || user?.role === "admin") {
      return searchQueryMatch;
    }

    if (user?.role === "client") {
      return searchQueryMatch && p.id === user.projectId;
    }

    // Designer or other staff - only show projects where they are assigned to at least one task
    // or assigned as a designer/worker on the project itself
    const isAssignedOnProject = 
      p.designer?._id === user?.id || 
      p.workers?.some((w: any) => (w._id || w) === user?.id);
    
    return searchQueryMatch && isAssignedOnProject;
  });

  const canAdd = user?.role === "architect" || user?.role === "director";

  const columns: Column<Project>[] = [
    {
      header: "Project",
      render: (project) => (
        <div>
          <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{project.name}</p>
          <p className="text-xs font-medium text-slate-500">{project.client}</p>
        </div>
      ),
    },
    {
      header: "Location",
      render: (project) => <span className="text-sm font-medium text-slate-600">{project.location}</span>,
    },
    {
      header: "Designer",
      render: (project: any) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-[10px] font-medium text-indigo-600 border border-indigo-100 font-mono">
            {project.designer?.name?.[0] || "—"}
          </div>
          <span className="text-sm font-medium text-slate-700">{project.designer?.name || "—"}</span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (project) => (
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full",
            project.status === "In Progress" ? "bg-green-500" : "bg-blue-500")} />
          <span className="text-xs font-medium text-slate-700">{project.status}</span>
        </div>
      ),
    },
    {
      header: "Progress",
      render: (project) => (
        <div className="flex items-center gap-4">
          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600" style={{ width: `${project.progress}%` }} />
          </div>
          <span className="text-xs font-medium text-slate-900 font-mono">{project.progress}%</span>
        </div>
      ),
    },
    {
      header: "Action",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (project) => (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/projects/${project.id}`}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            title="View Details"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
          {canAdd && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingProject(project);
                  setForm({
                    name: project.name,
                    clientId: project.clientId || "",
                    location: project.location,
                    startDate: project.startDate || "",
                    expectedCompletion: project.expectedCompletion || "",
                    budget: String(project.budget || ""),
                    designerId: (project as any).designer?._id || (project as any).designerId || "",
                  });
                  setIsAddModalOpen(true);
                }}
                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                title="Edit Project"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setProjectToDelete(project.id);
                  setIsConfirmOpen(true);
                }}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Delete Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const handleDelete = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject(projectToDelete);
      toast.success("Project deleted successfully");
      setIsConfirmOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    if (!form.name.trim()) newErrors.name = "Project name is required";
    if (!form.clientId) newErrors.clientId = "Please select a client";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingProject) {
        await updateProject(editingProject.id, {
          name: form.name,
          clientId: form.clientId,
          location: form.location,
          startDate: form.startDate,
          expectedCompletion: form.expectedCompletion,
          budget: form.budget,
          designerId: form.designerId,
        } as any);
        toast.success("Project updated successfully!");
      } else {
        await createProject({
          name: form.name,
          clientId: form.clientId,
          location: form.location,
          startDate: form.startDate,
          expectedCompletion: form.expectedCompletion,
          budget: form.budget,
          designerId: form.designerId,
          stages: defaultStages,
        } as any);
        toast.success("Project created successfully!");
      }

      if (fetchProjects) await fetchProjects();
      setForm(emptyForm);
      setEditingProject(null);
      setErrors({});
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error(editingProject ? "Failed to update project" : "Failed to create project");
    }
  };

  return (
    <>
      <div className="space-y-4 animate-in fade-in duration-500 w-full p-4 sm:p-6">
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {user?.role === "client" ? "My Project" : "Project Portfolio"}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
              {user?.role === "client" ? "Construction Progress" : "Active Construction Sites"}
            </p>
          </div>
          
          {canAdd && (
            <Button onClick={() => {
              setEditingProject(null);
              setForm(emptyForm);
              setIsAddModalOpen(true);
            }} size="sm" className="rounded-xl font-bold text-xs gap-2 bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-100">
              <Plus className="w-4 h-4" /> New Project
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search projects..." 
              className="pl-9 h-9 text-xs border-none bg-transparent focus:ring-0 shadow-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">{filteredProjects.length} Projects</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable 
            columns={columns} 
            data={filteredProjects} 
            onRowClick={(p) => router.push(`/projects/${p.id}`)}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? This will permanently remove all associated data, tasks, and photos."
      />

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}
        title={editingProject ? "Edit Project" : "Create New Project"} className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">

          {/* Project Name & Client Selection - Side by Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Project Name *</label>
              <Input 
                placeholder="e.g., Modern Villa" 
                value={form.name}
                onChange={e => {
                  setForm(f => ({ ...f, name: e.target.value }));
                  if (errors.name) setErrors(prev => {
                    const { name, ...rest } = prev;
                    return rest;
                  });
                }} 
                error={errors.name}
              />
            </div>
            
            <div className="space-y-2">
              <Select
                label="Select Client *"
                options={clientStaff.map(c => ({
                  value: c._id,
                  label: c.name,
                  description: c.email
                }))}
                value={form.clientId}
                onChange={val => {
                  setForm(f => ({ ...f, clientId: val }));
                  if (errors.clientId) setErrors(prev => {
                    const { clientId, ...rest } = prev;
                    return rest;
                  });
                }}
                placeholder={isLoadingData ? "Loading clients..." : "Select a client..."}
                disabled={isLoadingData || clientStaff.length === 0}
                error={errors.clientId}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 ml-1">Location</label>
            <Input 
              placeholder="e.g., Ahmedabad, Gujarat" 
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))} 
            />
          </div>

          {/* Dates & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Start Date</label>
              <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Expected Completion</label>
              <Input type="date" value={form.expectedCompletion} onChange={e => setForm(f => ({ ...f, expectedCompletion: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Budget</label>
              <Input placeholder="e.g., ₹85,00,000" value={form.budget}
                onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} className="font-mono" />
            </div>
          </div>

          {/* Designer Selection */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-sm font-medium text-slate-700 ml-1 flex items-center gap-2">
              <HardHat className="w-4 h-4 text-indigo-600" /> Assign Designer (Optional)
            </label>
            {isLoadingData ? (
              <p className="text-xs text-slate-400 ml-1">Loading designers…</p>
            ) : designers.length === 0 ? (
              <p className="text-xs text-slate-400 ml-1 italic">No designers found. Add staff with Architect / Designer / Director role.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {designers.map(des => (
                  <button
                    key={des._id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, designerId: f.designerId === des._id ? "" : des._id }))}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                      form.designerId === des._id
                        ? "bg-indigo-50 border-indigo-400 shadow-sm"
                        : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all flex-shrink-0",
                      form.designerId === des._id 
                        ? "bg-indigo-600 text-white shadow-sm" 
                        : "bg-slate-100 text-slate-600"
                    )}>
                      {des.name?.[0]?.toUpperCase() || "D"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{des.name}</p>
                      <p className="text-xs text-slate-500">{des.role?.name}</p>
                      {des.email && (
                        <p className="text-xs text-slate-400 truncate">{des.email}</p>
                      )}
                    </div>
                    {form.designerId === des._id && (
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button 
              variant="secondary" 
              type="button" 
              onClick={() => { 
                setIsAddModalOpen(false); 
                setForm(emptyForm); 
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!form.name.trim() || !form.clientId}
            >
              {editingProject ? "Update Project" : "Create Project"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}