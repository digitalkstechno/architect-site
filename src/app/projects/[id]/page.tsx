"use client";

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
  Plus,
  PenTool,
  Hammer,
  Trash2,
    FileText,
} from "lucide-react";
import Link from "next/link";
import { useState, use, useEffect, useRef, useMemo } from "react";
import { cn, formatDateForDisplay } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useProjects } from "@/lib/projects-store";
import { useOfficeTasks } from "@/lib/office-tasks-store";
import { useSiteTasks } from "@/lib/site-tasks-store";
import { useSiteUpdates } from "@/lib/site-updates-store";
import { usePayments } from "@/lib/payments-store";
import { useTasks } from "@/lib/tasks-store";
import { staffService, StaffMember } from "@/services/staff.service";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DesignModule } from "@/components/projects/DesignModule";
import { ExecutionModule } from "@/components/projects/ExecutionModule";
import { sitePhotoService } from "@/services/sitePhoto.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

type Tab = "office-work" | "site-work" | "tasks" | "workers" | "photos" | "finances" | "timeline";

export default function ProjectDetailsPage({ params }: { params: any }) {
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const id = resolvedParams?.id;
  const { user } = useAuth();
  const { getProjectById, updateStageStatus, updateProject } = useProjects();
  const { officeTasks, updateOfficeTaskStatus, createOfficeTask } = useOfficeTasks();
  const { siteTasks, updateSiteTaskStatus, createSiteTask } = useSiteTasks();
  const { getTasksByProjectId } = useTasks();
  const { updates: allSiteUpdates } = useSiteUpdates();
  const { getPaymentsByProjectId, createPayment, deletePayment, updatePayment } = usePayments();

  const project = getProjectById(id);
  const isAdmin = user?.role === "architect" || user?.role === "director" || user?.role === "accountant";
  const [activeTab, setActiveTab] = useState<Tab>("office-work");
  const [projectPhotos, setProjectPhotos] = useState<{ id: string; url: string; date: string }[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isManageTeamModalOpen, setIsManageTeamModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [allStaff, setAllStaff] = useState<StaffMember[]>([]);
  const [paymentForm, setPaymentForm] = useState({
    milestone: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    status: "Pending" as any,
    notes: ""
  });
  const [editForm, setEditForm] = useState({
    name: project?.name || "",
    location: project?.location || "",
    startDate: project?.startDate || "",
    expectedCompletion: project?.expectedCompletion || "",
    budget: project?.budget || "",
    status: project?.status || "Planned",
    supervisorId: project?.supervisorId || "",
    workerIds: project?.workerIds || [] as string[],
  });
  const [taskForm, setTaskForm] = useState({
    title: "",
    type: "Office" as "Office" | "Site",
    category: "Civil" as "Civil" | "Interior",
    assignedTo: [] as string[],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    notes: ""
  });
  const [teamForm, setTeamForm] = useState({
    supervisorId: project?.supervisorId || "",
    workerIds: project?.workerIds || [] as string[],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    staffService.getAllStaff().then(setAllStaff).catch(console.error);
  }, []);

  useEffect(() => {
    if (project) {
      setEditForm({
        name: project.name,
        location: project.location,
        startDate: project.startDate,
        expectedCompletion: project.expectedCompletion,
        budget: project.budget,
        status: project.status,
        supervisorId: project.supervisorId || "",
        workerIds: project.workerIds || [],
      });
      setTeamForm({
        supervisorId: project.supervisorId || "",
        workerIds: project.workerIds || [],
      });
    }
  }, [project]);

  useEffect(() => {
    if (activeTab === "photos" && project) {
      setPhotosLoading(true);
      sitePhotoService.getPhotosByProject(project.id)
        .then((data: any) => {
          setProjectPhotos((data || []).map((p: any) => ({
            id: p._id || p.id,
            url: p.fileUrl,
            date: new Date(p.createdAt || p.date).toLocaleDateString(),
          })));
        })
        .catch(console.error)
        .finally(() => setPhotosLoading(false));
    }
  }, [activeTab, project]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !project) return;
    setIsUploading(true);
    try {
      await sitePhotoService.uploadPhotos(project.id, files);
      const data: any = await sitePhotoService.getPhotosByProject(project.id);
      setProjectPhotos((data || []).map((p: any) => ({
        id: p._id || p.id,
        url: p.fileUrl,
        date: new Date(p.createdAt || p.date).toLocaleDateString(),
      })));
      setShowPhotoUpload(false);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload photos.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await sitePhotoService.deletePhoto(photoId);
      setProjectPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleUpdateStageStatus = async (stageName: string, newStatus: any) => {
    if (!project) return;
    await updateStageStatus(project.id, stageName, newStatus);
    toast.success(`Stage ${stageName} updated to ${newStatus}`);
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    setIsSubmittingEdit(true);
    try {
      await updateProject(project.id, {
        name: editForm.name,
        location: editForm.location,
        startDate: editForm.startDate,
        expectedCompletion: editForm.expectedCompletion,
        budget: editForm.budget,
        status: editForm.status,
        supervisor: editForm.supervisorId || null,
        workers: editForm.workerIds,
      });
      toast.success("Project updated successfully");
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error("Failed to update project");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title) {
      toast.error("Please provide a task title");
      return;
    }
    if (!project) return;

    setIsSubmittingTask(true);
    try {
      if (taskForm.type === "Office") {
        await createOfficeTask({
          title: taskForm.title,
          projectId: project.id,
          project: project.name,
          category: taskForm.category as any,
          assignedTo: taskForm.assignedTo,
          status: "Pending",
          progress: 0,
          startDate: taskForm.startDate,
          endDate: taskForm.endDate,
          notes: taskForm.notes
        });
      } else {
        await createSiteTask({
          title: taskForm.title,
          projectId: project.id,
          project: project.name,
          category: taskForm.category as any,
          assignedTo: taskForm.assignedTo,
          status: "Pending",
          progress: 0,
          startDate: taskForm.startDate,
          endDate: taskForm.endDate,
          notes: taskForm.notes
        });
      }
      toast.success("Task created successfully");
      setIsAddTaskModalOpen(false);
      setTaskForm({
        title: "",
        type: "Office",
        category: "Civil",
        assignedTo: [],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        notes: ""
      });
    } catch (error) {
      toast.error("Failed to create task");
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    setIsSubmittingTeam(true);
    try {
      await updateProject(project.id, {
        supervisor: teamForm.supervisorId || null,
        workers: teamForm.workerIds,
      });
      toast.success("Project team updated");
      setIsManageTeamModalOpen(false);
    } catch (error) {
      toast.error("Failed to update team");
    } finally {
      setIsSubmittingTeam(false);
    }
  };

  const projectOfficeTasks = useMemo(() => {
    if (!project) return [];
    return officeTasks.filter(t =>
      t.projectId === project.id ||
      t.project === project.id ||
      (t.project as any)?._id === project.id ||
      (t.project as any)?.name === project.name ||
      t.project === project.name
    );
  }, [officeTasks, project]);

  const projectSiteTasks = useMemo(() => {
    if (!project) return [];
    return siteTasks.filter(t =>
      t.projectId === project.id ||
      t.project === project.id ||
      (t.project as any)?._id === project.id ||
      (t.project as any)?.name === project.name ||
      t.project === project.name
    );
  }, [siteTasks, project]);

  // Combine Office and Site tasks for the Tasks tab
  const [timelineFilter, setTimelineFilter] = useState<"all" | "office" | "site">("all");

  const projectTasks = useMemo(() => {
    const combined = [
      ...projectOfficeTasks.map(t => ({
        id: t.id,
        name: t.title,
        stage: t.category,
        assignee: t.assignedTo?.map((a: any) => a.name).join(", ") || "Unassigned",
        status: t.status,
        progress: t.progress,
        type: "Office" as const,
        startDate: t.startDate,
        deadline: t.endDate
      })),
      ...projectSiteTasks.map(t => ({
        id: t.id,
        name: t.title,
        stage: t.category,
        assignee: t.assignedTo?.map((a: any) => a.name).join(", ") || "Unassigned",
        status: t.status,
        progress: t.progress,
        type: "Site" as const,
        startDate: t.startDate,
        deadline: t.endDate
      }))
    ];
    return combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
  }, [projectOfficeTasks, projectSiteTasks]);

  const timelineEvents = useMemo(() => {
    return projectTasks.map((task, idx) => ({
      id: task.id,
      title: task.name,
      subtitle: `${task.type} work · ${task.stage}`,
      status: task.status,
      assignee: task.assignee,
      startDate: task.startDate,
      deadline: task.deadline,
      kind: "task" as const,
      category: task.type.toLowerCase() as "office" | "site",
      color: task.type === "Office" ? "indigo" : "amber",
      order: idx,
    })).sort((a, b) => {
      const aDeadline = a.deadline ? new Date(a.deadline).getTime() : undefined;
      const bDeadline = b.deadline ? new Date(b.deadline).getTime() : undefined;

      if (aDeadline !== undefined && bDeadline !== undefined) {
        return aDeadline - bDeadline;
      }
      return a.order - b.order;
    });
  }, [projectTasks]);

  const visibleTimelineEvents = useMemo(() => {
    if (timelineFilter === "all") return timelineEvents;
    return timelineEvents.filter((event) => event.kind === "task" && event.category === timelineFilter);
  }, [timelineEvents, timelineFilter]);

  const projectUpdates = useMemo(() => {
    if (!project) return [];
    return allSiteUpdates.filter(u => u.projectId === project.id || u.project === project.name);
  }, [allSiteUpdates, project]);
  
  // Extract all unique assigned staff from office, site and global tasks
  const projectWorkers = useMemo(() => {
    if (!project) return [];
    const staffFromOffice = projectOfficeTasks.flatMap(t => t.assignedTo || []);
    const staffFromSite = projectSiteTasks.flatMap(t => t.assignedTo || []);
    const allAssignedStaff = [...staffFromOffice, ...staffFromSite];
    
    // Use a Map to keep unique staff by ID
    const uniqueStaffMap = new Map();
    
    // Also include supervisor and project workers as a fallback/additional list if needed,
    // but prioritize staff assigned to tasks.
    if (project.supervisor) {
      const s = project.supervisor;
      uniqueStaffMap.set(s._id || s.id, { ...s, type: "Supervisor" });
    }
    
    allAssignedStaff.forEach((s: any) => {
      if (!s) return;
      const id = s._id || s.id || (typeof s === 'string' ? s : null);
      if (!id) return;
      
      if (!uniqueStaffMap.has(id)) {
        uniqueStaffMap.set(id, {
          id,
          name: s.name || (typeof s === 'string' ? s : "Unknown"),
          type: s.role?.name || s.role || "Staff",
          rate: s.rate || "N/A"
        });
      }
    });

    return Array.from(uniqueStaffMap.values());
  }, [project, projectOfficeTasks, projectSiteTasks]);

  const projectPayments = useMemo(() => {
    if (!project) return [];
    return getPaymentsByProjectId(project.id);
  }, [getPaymentsByProjectId, project]);

  const { totalReceived, totalPending, utilization, budgetValue } = useMemo(() => {
    if (!project) return { totalReceived: 0, totalPending: 0, utilization: 0, budgetValue: 0 };
    const received = projectPayments.filter(p => p.status === "Paid").reduce((acc, p) => acc + p.amount, 0);
    const budgetValue = typeof project.budget === 'number' ? project.budget : Number(String(project.budget).replace(/[^0-9.-]+/g, "")) || 0;
    const pending = Math.max(0, budgetValue - received);
    const util = budgetValue > 0 ? Math.min(100, Math.round((received / budgetValue) * 100)) : 0;
    return { totalReceived: received, totalPending: pending, utilization: util, budgetValue };
  }, [project, projectPayments]);

  if (!project) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <Link href="/projects" className="text-indigo-600 hover:underline mt-4 inline-block">Back to Projects</Link>
      </div>
    );
  }

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.milestone || !paymentForm.amount) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSubmittingPayment(true);
    try {
      if (editingPayment) {
        await updatePayment(editingPayment.id, {
          milestone: paymentForm.milestone,
          amount: Number(paymentForm.amount),
          date: paymentForm.date,
          status: paymentForm.status,
          notes: paymentForm.notes
        });
        toast.success("Payment updated");
      } else {
        await createPayment({
          projectId: project.id,
          project: project.id, // Send ObjectID string
          clientId: project.clientId || "",
          client: project.clientId || "", // Send ObjectID string
          milestone: paymentForm.milestone,
          amount: Number(paymentForm.amount),
          date: paymentForm.date,
          status: paymentForm.status,
          notes: paymentForm.notes
        });
        toast.success("Payment recorded");
      }
      setIsPaymentModalOpen(false);
      setEditingPayment(null);
      setPaymentForm({
        milestone: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        status: "Pending",
        notes: ""
      });
    } catch (error) {
      toast.error(editingPayment ? "Failed to update payment" : "Failed to record payment");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;
    setIsDeleting(true);
    try {
      await deletePayment(paymentToDelete);
      toast.success("Payment record deleted");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete payment");
    } finally {
      setIsDeleting(false);
      setPaymentToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="space-y-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-[10px] font-semibold text-slate-400 hover:text-indigo-600 transition-colors group uppercase tracking-wider"
          >
            <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
            Back to Projects
          </Link>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">{project.name}</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                {project.location}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span className="font-mono">{formatDateForDisplay(project.startDate)}</span>
              </span>
              <span className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-md text-[9px] font-semibold uppercase tracking-wider shadow-sm">
                {project.status}
              </span>
              <span className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-md text-[9px] font-semibold uppercase tracking-wider shadow-sm">
                {project.progress || 0}% PROGRESS
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-medium shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              Project Settings
            </button>
          )}
          {/* <Link href="/site-updates"><Button size="sm" className="gap-2 font-medium">
            <Plus className="w-4 h-4" />
            Daily Log
          </Button></Link> */}
        </div>
      </div>

      <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg shadow-sm overflow-x-auto scrollbar-hide sticky top-20 z-10">
        {[
          { id: "office-work", label: "Office", icon: PenTool },
          { id: "site-work", label: "Site", icon: Hammer },
          { id: "tasks", label: "Tasks", icon: CheckCircle2 },
          { id: "workers", label: "Team", icon: Users },
          // { id: "updates", label: "Logs", icon: ClipboardList },
          { id: "photos", label: "Photos", icon: Camera },
          { id: "finances", label: "Finances", icon: CreditCard },
          { id: "timeline", label: "Timeline", icon: History },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-medium transition-all duration-200 whitespace-nowrap",
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px] animate-in fade-in slide-in-from-top-4 duration-500">
        {activeTab === "office-work" && (
          <DesignModule 
            tasks={projectOfficeTasks} 
            projectId={project.id} 
            updateTaskStatus={updateOfficeTaskStatus}
          />
        )}

        {activeTab === "site-work" && (
          <ExecutionModule 
            tasks={projectSiteTasks} 
            projectId={project.id} 
            updateTaskStatus={updateSiteTaskStatus}
          />
        )}

        {activeTab === "tasks" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              {isAdmin && (
                <Button 
                  size="sm" 
                  className="gap-2 text-[10px] font-bold uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500"
                  onClick={() => setIsAddTaskModalOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5" /> Create Task
                </Button>
              )}
            </div>
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="px-4 py-3">Task Details</TableHead>
                  <TableHead className="px-4 py-3">Assignee</TableHead>
                  <TableHead className="px-4 py-3">Deadline</TableHead>
                  <TableHead className="px-4 py-3">Status & Progress</TableHead>
                  <TableHead className="px-4 py-3 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-50">
                {projectTasks.map((task) => (
                  <TableRow key={task.id} className="group hover:bg-slate-50/30 transition-all">
                    <TableCell className="px-4 py-4">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-xs font-semibold text-slate-900">{task.name}</p>
                        <span className={cn(
                          "text-[7px] font-bold px-1 py-0 rounded border uppercase tracking-wider",
                          task.type === "Office" ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-orange-50 text-orange-600 border-orange-100"
                        )}>
                          {task.type}
                        </span>
                      </div>
                      <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0 rounded uppercase tracking-wider border border-indigo-100/50">{task.stage}</span>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-50 rounded-md flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300">
                          {task.assignee?.split(',')[0]?.split(' ').map((n: string) => n[0]).join('') || "U"}
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{task.assignee || "Unassigned"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <span className="text-xs font-medium text-slate-500">{task.deadline || "N/A"}</span>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div className="space-y-2 max-w-[120px]">
                        <div className="flex justify-between items-center text-[9px] font-bold">
                          <span className={cn(
                            "uppercase tracking-widest",
                            task.status === "In Progress" || task.status === "On Track" ? "text-blue-600" :
                            task.status === "Completed" ? "text-green-600" :
                            task.status === "Critical" ? "text-red-600" :
                            task.status === "Delayed" ? "text-orange-600" :
                            "text-slate-500"
                          )}>
                            {task.status}
                          </span>
                          <span className="text-slate-500 font-mono">{task.progress}%</span>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 transition-all duration-500" 
                            style={{ width: `${task.progress}%` }} 
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right">
                      <button className="text-slate-300 hover:text-indigo-600 p-1 hover:bg-white hover:shadow-sm rounded-md transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        )}

        {activeTab === "workers" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              {isAdmin && (
                <Button 
                  size="sm" 
                  className="gap-2 text-[10px] font-bold uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500"
                  onClick={() => setIsManageTeamModalOpen(true)}
                >
                  <Users className="w-3.5 h-3.5" /> Manage Team
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {projectWorkers.map((worker) => (
              <div key={worker.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-all duration-300 group">
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-lg font-bold text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    {worker.name?.split(' ').map((n: string) => n[0]).join('') || "W"}
                  </div>
                </div>
                <div className="text-center space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900 tracking-tight">{worker.name}</h4>
                  <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">{worker.type}</p>
                </div>
                <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Rate</span>
                  <span className="text-xs font-bold text-slate-900">{worker.rate}</span>
                </div>
                <button className="w-full py-2 bg-slate-50 text-slate-500 rounded-md text-[10px] font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100 uppercase tracking-wider">
                  Profile
                </button>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* {activeTab === "updates" && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-8">
            {projectUpdates.map((update, idx) => (
              <div key={update.id} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <ClipboardList className="w-5 h-5 text-indigo-600 group-hover:text-white" />
                  </div>
                  {idx !== projectUpdates.length - 1 && <div className="w-px flex-1 bg-slate-100 my-2" />}
                </div>
                <div className="pb-8 border-b border-slate-50 last:border-0 last:pb-0 flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900 tracking-tight">{update.date}</p>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold uppercase tracking-wider rounded-md border border-indigo-100/50">
                      Supervisor log
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed max-w-2xl font-medium">
                    {update.update}
                  </p>
                  <div className="flex items-center gap-4 pt-1">
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-500 uppercase tracking-wider">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {update.progress}%
                    </span>
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      <Camera className="w-3.5 h-3.5" />
                      {update.photos} Photos
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )} */}

        {activeTab === "finances" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Financial Overview</h3>
              {isAdmin && (
                <Button 
                  size="sm" 
                  className="gap-2 text-[10px] font-bold uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-100"
                  onClick={() => setIsPaymentModalOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5" /> Record Payment
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1 hover:shadow-md transition-shadow">
                <div className="bg-green-50 p-2 rounded-lg w-fit mb-1 border border-green-100">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Received</p>
                <p className="text-xl font-bold text-slate-900 tracking-tight">${totalReceived.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1 hover:shadow-md transition-shadow">
                <div className="bg-orange-50 p-2 rounded-lg w-fit mb-1 border border-orange-100">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pending Amount</p>
                <p className="text-xl font-bold text-slate-900 tracking-tight">${totalPending.toLocaleString()}</p>
              </div>
              <div className="bg-indigo-600 p-4 rounded-xl shadow-lg flex items-center justify-between group cursor-pointer overflow-hidden relative border border-indigo-500">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10 space-y-0.5">
                  <p className="text-indigo-100 text-[9px] font-bold uppercase tracking-widest">Budget Utilization</p>
                  <p className="text-sm font-bold text-white tracking-tight">${budgetValue.toLocaleString()}</p>
                  <div className="w-24 h-1 bg-indigo-400 rounded-full mt-2 overflow-hidden">
                    <div className="bg-white h-full" style={{ width: `${utilization}%` }} />
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-white relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest">Milestone</TableHead>
                    <TableHead className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest">Amount</TableHead>
                    <TableHead className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest">Date</TableHead>
                    <TableHead className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
                    <TableHead className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-widest">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-50">
                  {projectPayments.map((payment) => (
                    <TableRow key={payment.id} className="group hover:bg-slate-50/30 transition-all">
                      <TableCell className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-900">{payment.milestone}</p>
                        {payment.notes && <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 italic">{payment.notes}</p>}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-900">${payment.amount.toLocaleString()}</p>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">{payment.date}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border",
                          payment.status === "Paid" ? "bg-green-50 text-green-700 border-green-100" : 
                          payment.status === "Pending" ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                          "bg-red-50 text-red-700 border-red-100"
                        )}>
                          {payment.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isAdmin && (
                            <>
                              <button 
                                onClick={() => {
                                  setEditingPayment(payment);
                                  setPaymentForm({
                                    milestone: payment.milestone,
                                    amount: String(payment.amount),
                                    date: payment.date,
                                    status: payment.status,
                                    notes: payment.notes || ""
                                  });
                                  setIsPaymentModalOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              >
                                <PenTool className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => {
                                  setPaymentToDelete(payment.id);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {projectPayments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-slate-400 italic text-xs font-medium uppercase tracking-widest">No payment history available</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        <Modal 
          isOpen={isPaymentModalOpen} 
          onClose={() => {
            setIsPaymentModalOpen(false);
            setEditingPayment(null);
          }}
          title={editingPayment ? "Edit Payment Record" : "Add Payment Record"}
        >
          <form onSubmit={handleAddPayment} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Milestone Name</label>
                <Input 
                  placeholder="e.g., Slab Completion" 
                  value={paymentForm.milestone}
                  onChange={e => setPaymentForm({...paymentForm, milestone: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Amount ($)</label>
                <Input 
                  type="number" 
                  placeholder="5000" 
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Payment Date</label>
                <Input 
                  type="date" 
                  value={paymentForm.date}
                  onChange={e => setPaymentForm({...paymentForm, date: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
                <select 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={paymentForm.status}
                  onChange={e => setPaymentForm({...paymentForm, status: e.target.value})}
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Notes</label>
              <textarea 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[80px]"
                placeholder="Details about this transaction..."
                value={paymentForm.notes}
                onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
              <Button variant="ghost" type="button" onClick={() => {
                setIsPaymentModalOpen(false);
                setEditingPayment(null);
              }}>Cancel</Button>
              <Button type="submit" isLoading={isSubmittingPayment} className="bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-100">
                {editingPayment ? "Update Payment" : "Record Payment"}
              </Button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeletePayment}
          isLoading={isDeleting}
          title="Delete Payment Record"
          message="Are you sure you want to delete this payment record? This action cannot be undone."
        />

        {/* Edit Project Modal */}
        <Modal
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Project Details"
        >
          <form onSubmit={handleEditProject} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Project Name</label>
              <Input 
                value={editForm.name}
                onChange={e => setEditForm({...editForm, name: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Location</label>
              <Input 
                value={editForm.location}
                onChange={e => setEditForm({...editForm, location: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                <Input 
                  type="date" 
                  value={editForm.startDate}
                  onChange={e => setEditForm({...editForm, startDate: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Expected Completion</label>
                <Input 
                  type="date" 
                  value={editForm.expectedCompletion}
                  onChange={e => setEditForm({...editForm, expectedCompletion: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Budget ($)</label>
                <Input 
                  type="number" 
                  value={editForm.budget}
                  onChange={e => setEditForm({...editForm, budget: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
                <select 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={editForm.status}
                  onChange={e => setEditForm({...editForm, status: e.target.value})}
                >
                  <option value="Planned">Planned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Supervisor</label>
              <select 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={editForm.supervisorId}
                onChange={e => setEditForm({...editForm, supervisorId: e.target.value})}
              >
                <option value="">Select Supervisor...</option>
                {allStaff.filter(s => s.role?.name?.toLowerCase() === "supervisor" || s.role?.name?.toLowerCase() === "architect").map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.role?.name})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Team Workers</label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50/50">
                {allStaff.filter(s => s.role?.name?.toLowerCase() === "worker" || s.role?.name?.toLowerCase() === "staff").map(s => (
                  <label key={s._id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={editForm.workerIds.includes(s._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditForm({...editForm, workerIds: [...editForm.workerIds, s._id]});
                        } else {
                          setEditForm({...editForm, workerIds: editForm.workerIds.filter(id => id !== s._id)});
                        }
                      }}
                    />
                    <span className="text-xs font-medium text-slate-700">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
              <Button variant="ghost" type="button" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={isSubmittingEdit} className="bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-100">
                Update Project
              </Button>
            </div>
          </form>
         </Modal>

         {/* Add Task Modal */}
         <Modal 
           isOpen={isAddTaskModalOpen} 
           onClose={() => setIsAddTaskModalOpen(false)}
           title="Create New Task"
         >
           <form onSubmit={handleAddTask} className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Task Type</label>
                 <select 
                   className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                   value={taskForm.type}
                   onChange={e => setTaskForm({...taskForm, type: e.target.value as any})}
                 >
                   <option value="Office">Office (Design)</option>
                   <option value="Site">Site (Execution)</option>
                 </select>
               </div>
               <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
                 <select 
                   className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                   value={taskForm.category}
                   onChange={e => setTaskForm({...taskForm, category: e.target.value as any})}
                 >
                   <option value="Civil">Civil</option>
                   <option value="Interior">Interior</option>
                 </select>
               </div>
             </div>

             <div className="space-y-1.5">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Task Title</label>
               <Input 
                 placeholder="e.g., Layout Plan Finalization" 
                 value={taskForm.title}
                 onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                 required
               />
             </div>

             <div className="space-y-1.5">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assign To</label>
               <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50/50">
                 {allStaff.filter(s => s.role?.name?.toLowerCase() !== "client").map(s => (
                   <label key={s._id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                     <input 
                       type="checkbox" 
                       className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                       checked={taskForm.assignedTo.includes(s._id)}
                       onChange={(e) => {
                         if (e.target.checked) {
                           setTaskForm({...taskForm, assignedTo: [...taskForm.assignedTo, s._id]});
                         } else {
                           setTaskForm({...taskForm, assignedTo: taskForm.assignedTo.filter(id => id !== s._id)});
                         }
                       }}
                     />
                     <span className="text-xs font-medium text-slate-700">{s.name}</span>
                   </label>
                 ))}
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                 <Input
                   type="date"
                   value={taskForm.startDate}
                   onChange={e => setTaskForm({...taskForm, startDate: e.target.value})}
                   required
                 />
               </div>
               <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                 <Input
                   type="date"
                   value={taskForm.endDate}
                   onChange={e => setTaskForm({...taskForm, endDate: e.target.value})}
                   required
                 />
               </div>
             </div>

             <div className="space-y-1.5">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Notes</label>
               <textarea 
                 className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[80px]"
                 placeholder="Describe the task..."
                 value={taskForm.notes}
                 onChange={e => setTaskForm({...taskForm, notes: e.target.value})}
               />
             </div>

             <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
               <Button variant="ghost" type="button" onClick={() => setIsAddTaskModalOpen(false)}>Cancel</Button>
               <Button type="submit" isLoading={isSubmittingTask} className="bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-100">
                 Create Task
               </Button>
             </div>
           </form>
          </Modal>

          {/* Manage Team Modal */}
          <Modal 
            isOpen={isManageTeamModalOpen} 
            onClose={() => setIsManageTeamModalOpen(false)}
            title="Manage Project Team"
          >
            <form onSubmit={handleUpdateTeam} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Project Supervisor</label>
                <select 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={teamForm.supervisorId}
                  onChange={e => setTeamForm({...teamForm, supervisorId: e.target.value})}
                >
                  <option value="">Select Supervisor...</option>
                  {allStaff.filter(s => s.role?.name?.toLowerCase() === "supervisor" || s.role?.name?.toLowerCase() === "architect").map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.role?.name})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assigned Workers</label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50/50">
                  {allStaff.filter(s => s.role?.name?.toLowerCase() === "worker" || s.role?.name?.toLowerCase() === "staff").map(s => (
                    <label key={s._id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        checked={teamForm.workerIds.includes(s._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTeamForm({...teamForm, workerIds: [...teamForm.workerIds, s._id]});
                          } else {
                            setTeamForm({...teamForm, workerIds: teamForm.workerIds.filter(id => id !== s._id)});
                          }
                        }}
                      />
                      <span className="text-xs font-medium text-slate-700">{s.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <Button variant="ghost" type="button" onClick={() => setIsManageTeamModalOpen(false)}>Cancel</Button>
                <Button type="submit" isLoading={isSubmittingTeam} className="bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-100">
                  Update Team
                </Button>
              </div>
            </form>
          </Modal>
  
           {activeTab === "timeline" && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Project Schedule</h3>
                <p className="text-xs text-slate-500 mt-1">Dynamic timeline created from office/site project tasks.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTimelineFilter("all")}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-[10px] font-bold border transition-all",
                      timelineFilter === "all" ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-500 border-slate-100"
                    )}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimelineFilter("office")}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-[10px] font-bold border transition-all",
                      timelineFilter === "office" ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-500 border-slate-100"
                    )}
                  >
                    Office Work
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimelineFilter("site")}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-[10px] font-bold border transition-all",
                      timelineFilter === "site" ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-500 border-slate-100"
                    )}
                  >
                    Site Work
                  </button>
                </div>
                <button
                  onClick={() => setIsAddTaskModalOpen(true)}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-[10px] font-bold shadow-sm"
                >
                  Add Task
                </button>
              </div>
            </div>

            <div className="space-y-8 relative pl-6">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-100" />
              {visibleTimelineEvents.length > 0 ? (
                visibleTimelineEvents.map((event, idx) => (
                  <div key={event.id} className="relative flex gap-6 group">
                    <div className={cn(
                      "absolute -left-6 w-6 h-6 rounded-md border-2 border-white flex items-center justify-center z-10 transition-all duration-300 shadow-sm",
                      event.color === "indigo" ? "bg-indigo-500" : "bg-amber-500"
                    )}>
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{event.subtitle}</span>
                        <span className={cn(
                          "text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                          event.status === "Completed" ? "bg-emerald-100 text-emerald-700" :
                          event.status === "In Progress" ? "bg-indigo-100 text-indigo-700" :
                          event.status === "Delayed" ? "bg-rose-100 text-rose-700" :
                          "bg-slate-100 text-slate-500"
                        )}
                        >{event.status}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 tracking-tight">{event.title}</h4>
                      <div className="flex flex-wrap gap-3 text-[10px] text-slate-500">
                        <span>Assigned to: {event.assignee}</span>
                        {event.startDate && <span>Start: {formatDateForDisplay(event.startDate)}</span>}
                        {event.deadline && <span>Due: {formatDateForDisplay(event.deadline)}</span>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-slate-400 italic text-xs">No timeline events available for this filter.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === "photos" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-xs font-bold shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Camera className="w-3.5 h-3.5" />
                {isUploading ? "Uploading..." : "Upload Photos"}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {photosLoading ? (
                <div className="col-span-full flex items-center justify-center py-10">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {projectPhotos.map((photo: any) => (
                    <div key={photo.id} className="aspect-square bg-slate-50 rounded-lg border border-slate-100 shadow-sm group hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden max-w-[120px]">
                      <img src={photo.url} alt="Project photo" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                        <p className="text-white text-[7px] font-bold uppercase tracking-wider">{photo.date}</p>
                        <p className="text-indigo-300 text-[6px] font-black uppercase tracking-tighter text-center line-clamp-1">{photo.uploadedBy || "Staff"}</p>
                        <div className="flex gap-1 mt-1">
                          <a href={photo.url} target="_blank" rel="noreferrer" className="p-1 bg-white/20 hover:bg-white/40 text-white rounded transition-colors">
                            <ArrowUpRight className="w-2.5 h-2.5" />
                          </a>
                          <button onClick={() => handleDeletePhoto(photo.id)} className="p-1 bg-red-500/20 hover:bg-red-500 text-white rounded transition-colors">
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {projectPhotos.length === 0 && [1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square bg-slate-50 rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 max-w-[120px]">
                      <Camera className="w-4 h-4 text-slate-200" />
                      <p className="text-[7px] font-bold text-slate-300 uppercase tracking-wider">Empty</p>
                    </div>
                  ))}

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square w-full max-w-[120px] bg-indigo-50 rounded-lg border border-dashed border-indigo-200 flex flex-col items-center justify-center gap-1 group hover:bg-indigo-100 transition-all"
                  >
                    <Plus className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                    <p className="text-[8px] font-bold text-indigo-600 uppercase tracking-wider">Add</p>
                  </button>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
          </div>
        )}
      </div>
    </div>
  );
}
