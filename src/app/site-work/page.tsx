"use client";

import { useState, useEffect, Fragment } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Hammer, Camera, ClipboardList, MapPin, CheckCircle2, Plus, Minus, Search, Filter, ArrowRight, HardHat, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn, formatDateForDisplay, toTitleCase } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ActionButtons } from "@/components/ui/ActionButtons";

import { useAuth } from "@/lib/auth-context";
import { useSiteTasks, SiteTaskCategory } from "@/lib/site-tasks-store";
import { useProjects } from "@/lib/projects-store";
import { staffService, StaffMember } from "@/services/staff.service";
import { TaskImageUpload } from "@/components/projects/TaskImageUpload";
import { Select } from "@/components/ui/Select";
import toast from "react-hot-toast";

export default function SiteWorkPage() {
  const { user } = useAuth();
  const canCreate = user?.role === "architect" || user?.role === "director" || user?.role === "site-engineer" || user?.role === "supervisor";
  const isViewOnly = false;
  const isAdminRole = user?.role === "architect" || user?.role === "director";
  const canDeleteImages = (task: any) => isAdminRole || task.assignedTo?.some((s: any) => (s._id || s.id || s) === user?.id);
  const { siteTasks, createSiteTask, updateSiteTask, updateSiteTaskStatus, deleteSiteTask, refreshTasks } = useSiteTasks();
  const { projects } = useProjects();

  const [activeTab, setActiveTab] = useState<SiteTaskCategory>("Civil");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [noteValues, setNoteValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [newTask, setNewTask] = useState({
    title: "",
    project: "",
    assignedTo: [] as string[],
    status: "On Track",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    staffService.getAllStaff().then(setStaffList).catch(console.error);
  }, []);

  const siteStaff = staffList.filter(s => {
    const roleName = s.role?.name?.toLowerCase() || "";
    return roleName &&
      !roleName.includes("director") &&
      !roleName.includes("admin") &&
      !roleName.includes("client") &&
      !roleName.includes("designer");
  });

  const siteStats = [
    { title: "Active Sites", count: projects.filter(p => p.status === "In Progress" || p.status === "Active").length, icon: MapPin, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "On-site Team", count: siteStaff.length, icon: HardHat, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Site Logs", count: siteTasks.length, icon: ClipboardList, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Inspections", count: siteTasks.reduce((sum, task) => sum + (task.inspections || 0), 0), icon: CheckCircle2, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!newTask.project) newErrors.project = "Please select a project";
    if (!newTask.title.trim()) newErrors.title = "Activity title is required";
    if (newTask.assignedTo.length === 0) newErrors.assignedTo = "Please assign to staff";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    const selectedProject = projects.find(p => p.id === newTask.project);
    if (!selectedProject) return;

    try {
      if (editingTask) {
        await updateSiteTask(editingTask.id, {
          title: newTask.title,
          projectId: selectedProject.id,
          project: selectedProject.name,
          assignedTo: newTask.assignedTo,
          status: newTask.status as any,
          startDate: newTask.startDate,
          endDate: newTask.endDate,
        });
        toast.success("Site task updated successfully!");
      } else {
        await createSiteTask({
          title: newTask.title,
          projectId: selectedProject.id,
          project: selectedProject.name,
          category: activeTab,
          assignedTo: newTask.assignedTo,
          status: newTask.status as any,
          progress: 0,
          startDate: newTask.startDate,
          endDate: newTask.endDate,
        });
        toast.success("Site task created successfully!");
      }

      setIsModalOpen(false);
      setEditingTask(null);
      setNewTask({ title: "", project: "", assignedTo: [], status: "On Track", startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] });
      setErrors({});
    } catch (error) {
      console.error("Error saving site task:", error);
      toast.error(editingTask ? "Failed to update task" : "Failed to create task");
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      await deleteSiteTask(taskToDelete);
      toast.success("Task deleted successfully");
      setIsConfirmOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const filteredTasks = siteTasks.filter(t => {
    const isCategory = t.category === activeTab;
    if (!canCreate) {
      const isAssigned = t.assignedTo?.some((s: any) => (s._id || s.id || s) === user?.id);
      return isCategory && isAssigned;
    }
    return isCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full p-4 sm:p-6">
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">SITE WORK</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">On-site Execution & Logs</p>
        </div>

        {canCreate && (
          <Button onClick={() => {
            setEditingTask(null);
            setNewTask({ title: "", project: "", assignedTo: [], status: "On Track", startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] });
            setIsModalOpen(true);
          }} size="sm" className="rounded-xl font-bold text-xs gap-2 bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-100 text-white">
            <Plus className="w-4 h-4" /> New Task
          </Button>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Site Task"
        message="Are you sure you want to delete this site task? This will remove all associated technical notes and photos."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
          setNewTask({ title: "", project: "", assignedTo: [], status: "On Track", startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] });
          setErrors({});
        }}
        title={editingTask ? "Edit Site Task" : `Create New ${activeTab} Site Task`}
      >
        <form onSubmit={handleAddLog} className="space-y-6">
          <div className="space-y-2">
            <Select
              label="Project"
              options={projects.map(p => ({ value: p.id, label: p.name }))}
              value={newTask.project}
              onChange={(val) => {
                setNewTask({ ...newTask, project: val });
                if (errors.project) setErrors(prev => {
                  const { project, ...rest } = prev;
                  return rest;
                });
              }}
              placeholder="Select Project"
              error={errors.project}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Current Task / Activity</label>
            <Input
              placeholder="e.g., Foundation Casting"
              value={newTask.title}
              onChange={(e) => {
                setNewTask({ ...newTask, title: e.target.value });
                if (errors.title) setErrors(prev => {
                  const { title, ...rest } = prev;
                  return rest;
                });
              }}
              error={errors.title}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Select
                label="Assign To"
                options={siteStaff.map(s => ({
                  value: s._id,
                  label: s.name,
                  description: s.role?.name || s.team
                }))}
                value={newTask.assignedTo[0] || ""}
                onChange={(val) => {
                  setNewTask({ ...newTask, assignedTo: [val] });
                  if (errors.assignedTo) setErrors(prev => {
                    const { assignedTo, ...rest } = prev;
                    return rest;
                  });
                }}
                placeholder="Select Staff"
                error={errors.assignedTo}
              />
            </div>
            <div className="space-y-2">
              <Select
                label="Status"
                options={[
                  { value: "On Track", label: "On Track" },
                  { value: "Delayed", label: "Delayed" },
                  { value: "Critical", label: "Critical" },
                ]}
                value={newTask.status}
                onChange={(val) => setNewTask({ ...newTask, status: val })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Start Date</label>
              <Input
                type="date"
                value={newTask.startDate}
                onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">End Date</label>
              <Input
                type="date"
                value={newTask.endDate}
                onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium">
              {editingTask ? "Update Task" : "Save Task"}
            </Button>
          </div>
        </form>
      </Modal>

      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit shadow-sm">
        <button
          onClick={() => setActiveTab("Civil")}
          className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300", activeTab === "Civil" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}
        >
          Civil Work
        </button>
        <button
          onClick={() => setActiveTab("Interior")}
          className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300", activeTab === "Interior" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}
        >
          Interior Work
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {siteStats.map((stat) => (
          <Card key={stat.title} className="p-4 border-slate-100 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.title}</p>
                <h3 className="text-xl font-bold text-slate-900 font-mono leading-none mt-1">{stat.count}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6">
        <Card className=" border-slate-200 shadow-sm overflow-hidden rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-6 py-3 bg-slate-50/30">
            <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Execution - {activeTab}</CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400">
                <Filter className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-4">Site Task</TableHead>
                  <TableHead className="px-6 py-4">Project</TableHead>
                  <TableHead className="px-6 py-4">Status & Progress</TableHead>
                  <TableHead className="px-6 py-4">Staff</TableHead>
                  <TableHead className="px-6 py-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">No active site tasks found in this category.</TableCell>
                  </TableRow>
                )}
                {filteredTasks.map((task) => (
                  <Fragment key={task.id}>
                    <TableRow
                      className={cn(
                        "hover:bg-slate-50/50 transition-colors group cursor-pointer",
                        expandedTaskId === task.id && "bg-slate-50"
                      )}
                      onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner transition-colors",
                            task.status === "Completed" ? "bg-green-50 text-green-600 border-green-100" :
                              task.status === "Critical" ? "bg-red-50 text-red-600 border-red-100" :
                                "bg-slate-50 text-slate-400 border-slate-100"
                          )}>
                            {task.status === "Completed" ? <CheckCircle2 className="w-5 h-5" /> : <HardHat className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{task.title}</p>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded-md">Added: {formatDateForDisplay(task.createdAt)}</span>
                              {task.startDate && <span className="text-[11px] text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded-md">Start: {formatDateForDisplay(task.startDate)}</span>}
                              {task.endDate && <span className="text-[11px] text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded-md">End: {formatDateForDisplay(task.endDate)}</span>}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-700">{toTitleCase((task.project as any)?.name || task.project)}</p>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="space-y-2 max-w-[150px]">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className={cn(
                              "uppercase tracking-widest",
                              task.status === "Completed" ? "text-green-600" :
                                task.status === "Critical" ? "text-red-600" :
                                  task.status === "Delayed" ? "text-orange-600" : "text-blue-600"
                            )}>{task.status}</span>
                            <span className="text-slate-500 font-mono">{task.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 transition-all duration-500"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {task.assignedTo && task.assignedTo.length > 0 ? (
                            task.assignedTo.map((user: any, i: number) => (
                              <div
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-indigo-50 text-[11px] font-bold text-indigo-700 w-fit"
                                title={user.name || user}
                              >
                                {user.name || user}
                              </div>
                            ))
                          ) : (
                            <span className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">
                              Unassigned
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg h-8 px-1 mr-1" title="Inspection Count">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const current = task.inspections || 0;
                                if (current > 0) {
                                  updateSiteTask(task.id, { inspections: current - 1 });
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Decrease Inspection"
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <span className="w-6 text-center font-bold text-[11px] text-slate-700 font-mono">
                              {task.inspections || 0}
                            </span>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateSiteTask(task.id, { inspections: (task.inspections || 0) + 1 });
                              }}
                              className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                              title="Increase Inspection"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <ActionButtons
                            hasEdit={canCreate}
                            hasDelete={canCreate}
                            hasExpand={true}
                            isExpanded={expandedTaskId === task.id}
                            onEdit={(e) => {
                              e.stopPropagation();
                              setEditingTask(task);
                              setNewTask({
                                title: task.title,
                                project: (task.projectId || (task.project as any)?.id || task.project as any)?._id || (task.project as any)?.id || task.project as string,
                                assignedTo: task.assignedTo?.map((s: any) => s._id || s.id || s) || [],
                                status: task.status || "On Track",
                                startDate: task.startDate || new Date().toISOString().split('T')[0],
                                endDate: task.endDate || new Date().toISOString().split('T')[0],
                              });
                              setIsModalOpen(true);
                            }}
                            onDelete={(e) => {
                              e.stopPropagation();
                              setTaskToDelete(task.id);
                              setIsConfirmOpen(true);
                            }}
                            onExpand={(e) => {
                              e.stopPropagation();
                              setExpandedTaskId(expandedTaskId === task.id ? null : task.id);
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedTaskId === task.id && (
                      <TableRow className="bg-slate-50/30 border-b border-slate-100">
                        <TableCell colSpan={5} className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-2 duration-300">
                            <div className="space-y-4">
                              {!isViewOnly && (
                                <>
                                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Update Execution Status</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {["On Track", "In Progress", "Completed", "Critical", "Delayed"].map((status) => (
                                      <Button
                                        key={status}
                                        variant={task.status === status ? "primary" : "outline"}
                                        size="sm"
                                        className="rounded-xl text-[10px] h-8"
                                        onClick={(e) => { e.stopPropagation(); updateSiteTaskStatus(task.id, status as any); }}
                                      >
                                        {status}
                                      </Button>
                                    ))}
                                  </div>
                                </>
                              )}
                              <div className="pt-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Technical Notes</h4>
                                {false ? (
                                  <p className="text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100 shadow-sm italic">
                                    {task.notes || "No technical notes available."}
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    <textarea
                                      className="w-full text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                                      rows={3}
                                      placeholder="Add technical notes..."
                                      value={noteValues[task.id] ?? (task.notes || "")}
                                      onChange={(e) => setNoteValues(prev => ({ ...prev, [task.id]: e.target.value }))}
                                    />
                                    <Button
                                      size="sm"
                                      className="rounded-xl text-[10px] h-8 bg-indigo-600 hover:bg-indigo-500"
                                      onClick={async () => {
                                        await updateSiteTask(task.id, { notes: noteValues[task.id] ?? task.notes });
                                        setNoteValues(prev => {
                                          const next = { ...prev };
                                          delete next[task.id];
                                          return next;
                                        });
                                        toast.success("Technical notes saved successfully");
                                      }}
                                    >
                                      Save Notes
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Site Photos</h4>
                              <TaskImageUpload
                                taskId={task.id}
                                type="Site"
                                existingImages={task.images}
                                canDelete={canDeleteImages(task)}
                                onUploadComplete={() => {
                                  refreshTasks();
                                  toast.success("Site photos updated successfully");
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
