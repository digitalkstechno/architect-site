"use client";

import { useState, useEffect, Fragment } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PenTool, FileText, Clock, CheckCircle2, Plus, Search, Filter, ArrowRight, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { useAuth } from "@/lib/auth-context";
import { useOfficeTasks, OfficeTaskCategory } from "@/lib/office-tasks-store";
import { useProjects } from "@/lib/projects-store";
import { staffService, StaffMember } from "@/services/staff.service";
import { cn, formatDateForDisplay } from "@/lib/utils";
import { TaskImageUpload } from "@/components/projects/TaskImageUpload";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import toast from "react-hot-toast";

export default function OfficeWorkPage() {
  const { user } = useAuth();
  const canCreate = user?.role === "architect" || user?.role === "director" || user?.role === "office-team";
  const isViewOnly = false;
  const isAdminRole = user?.role === "architect" || user?.role === "director";
  const canDeleteImages = (task: any) => isAdminRole || task.assignedTo?.some((s: any) => (s._id || s.id || s) === user?.id);
  const { officeTasks, createOfficeTask, updateOfficeTask, updateOfficeTaskStatus, deleteOfficeTask, refreshTasks } = useOfficeTasks();
  const { projects } = useProjects();
  
  const [activeTab, setActiveTab] = useState<OfficeTaskCategory>("Civil");
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
    priority: "Medium",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    staffService.getAllStaff().then(setStaffList).catch(console.error);
  }, []);

  const officeStaff = staffList.filter(s => s.role?.name?.toLowerCase().includes("designer"));

  const categories = [
    { title: "Design Phase", count: officeTasks.filter(t => t.status === "In Progress").length, icon: PenTool, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Documentation", count: officeTasks.filter(t => t.status === "Pending").length, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Approvals", count: officeTasks.filter(t => t.status === "Completed").length, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    // { title: "Revisions", count: officeTasks.filter(t => t.priority === "High" || t.priority === "Critical").length, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    if (!newTask.title.trim()) newErrors.title = "Task title is required";
    if (!newTask.project) newErrors.project = "Please select a project";
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
        await updateOfficeTask(editingTask.id, {
          title: newTask.title,
          projectId: selectedProject.id,
          project: selectedProject.name,
          assignedTo: newTask.assignedTo,
          priority: newTask.priority,
          startDate: newTask.startDate,
          endDate: newTask.endDate,
        });
        toast.success("Office task updated successfully!");
      } else {
        await createOfficeTask({
          title: newTask.title,
          projectId: selectedProject.id,
          project: selectedProject.name,
          category: activeTab,
          assignedTo: newTask.assignedTo,
          priority: newTask.priority,
          status: "Pending",
          progress: 0,
          startDate: newTask.startDate,
          endDate: newTask.endDate,
        });
        toast.success("Office task created successfully!");
      }
      
      setIsModalOpen(false);
      setEditingTask(null);
      setNewTask({ title: "", project: "", assignedTo: [], priority: "Medium", startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] });
      setErrors({});
    } catch (error) {
      console.error("Error saving office task:", error);
      toast.error(editingTask ? "Failed to update task" : "Failed to create task");
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      await deleteOfficeTask(taskToDelete);
      toast.success("Task deleted successfully");
      setIsConfirmOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const filteredTasks = officeTasks.filter(t => {
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">OFFICE WORK</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Designs & Documentation</p>
        </div>
        
        {canCreate && (
          <Button onClick={() => {
            setEditingTask(null);
            setNewTask({ title: "", project: "", assignedTo: [], priority: "Medium", startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] });
            setIsModalOpen(true);
          }} size="sm" className="rounded-xl font-bold text-xs gap-2 bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-100">
            <Plus className="w-4 h-4" /> New Task
          </Button>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Office Task"
        message="Are you sure you want to delete this office task? This will remove all associated design data and notes."
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
          setNewTask({ title: "", project: "", assignedTo: [], priority: "Medium", startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] });
          setErrors({});
        }} 
        title={editingTask ? "Edit Office Task" : "Add New Office Task"}
      >
        <form onSubmit={handleAddTask} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Task Title</label>
            <Input
              placeholder="Enter task title..."
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className={cn("rounded-xl", errors.title && "border-red-500")}
            />
            {errors.title && <p className="text-[10px] text-red-500 font-medium">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project</label>
            <Select
              value={newTask.project}
              onChange={(value) => setNewTask({ ...newTask, project: value })}
              options={projects.map(p => ({ label: p.name, value: p.id }))}
              placeholder="Select project"
              className={cn(errors.project && "border-red-500")}
            />
            {errors.project && <p className="text-[10px] text-red-500 font-medium">{errors.project}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assign To</label>
            <div className="flex flex-wrap gap-2">
              {officeStaff.map((staff) => (
                <button
                  key={staff._id}
                  type="button"
                  onClick={() => {
                    const id = staff._id;
                    setNewTask(prev => ({
                      ...prev,
                      assignedTo: prev.assignedTo.includes(id)
                        ? prev.assignedTo.filter(a => a !== id)
                        : [...prev.assignedTo, id]
                    }))
                  }}
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold transition-all border",
                    newTask.assignedTo.includes(staff._id)
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                  )}
                >
                  {staff.name}
                </button>
              ))}
            </div>
            {errors.assignedTo && <p className="text-[10px] text-red-500 font-medium">{errors.assignedTo}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</label>
            <div className="flex gap-2">
              {["Low", "Medium", "High", "Critical"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewTask({ ...newTask, priority: p })}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all",
                    newTask.priority === p
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start Date</label>
              <Input
                type="date"
                value={newTask.startDate}
                onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End Date</label>
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
            <Button type="submit" className="font-medium bg-indigo-600 hover:bg-indigo-500">
              {editingTask ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </Modal>

      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit shadow-sm">
        <button
          onClick={() => setActiveTab("Civil")}
          className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300", activeTab === "Civil" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}
        >
          Civil Designing
        </button>
        <button
          onClick={() => setActiveTab("Interior")}
          className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300", activeTab === "Interior" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}
        >
          Interior Designing
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Card key={cat.title} className="p-4 border-slate-100 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", cat.bg)}>
                <cat.icon className={cn("w-5 h-5", cat.color)} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cat.title}</p>
                <h3 className="text-xl font-bold text-slate-900 font-mono leading-none mt-1">{cat.count}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6">
        <Card className=" border-slate-200 shadow-sm overflow-hidden rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-6 py-3 bg-slate-50/30">
            <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active {activeTab} Tasks</CardTitle>
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
                  <TableHead className="px-6 py-4">Task Detail</TableHead>
                  <TableHead className="px-6 py-4">Project</TableHead>
                  <TableHead className="px-6 py-4">Status & Progress</TableHead>
                  <TableHead className="px-6 py-4">Assigned To</TableHead>
                  <TableHead className="px-6 py-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">No active tasks found in this category.</TableCell>
                  </TableRow>
                )}
                {filteredTasks.map((task) => (
                  <Fragment key={task.id}>
                    <TableRow 
                      key={task.id} 
                      className={cn(
                        "hover:bg-slate-50/50 transition-colors group cursor-pointer",
                        expandedTaskId === task.id && "bg-slate-50"
                      )}
                      onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                    >
                      <TableCell className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900">{task.title}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={task.priority === "High" || task.priority === "Critical" ? "destructive" : "warning"} className="text-[9px] px-1.5 py-0">
                              {task.priority || "Medium"}
                            </Badge>
                            <span className="text-[10px] text-slate-400 font-medium font-mono">ID: {task.id.slice(-6)}</span>
                            {task.startDate && <span className="text-[10px] text-slate-400 font-medium font-mono">Start {formatDateForDisplay(task.startDate)}</span>}
                            {task.endDate && <span className="text-[10px] text-slate-400 font-medium font-mono">End {formatDateForDisplay(task.endDate)}</span>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-700">{(task.project as any)?.name || task.project}</p>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="space-y-2 max-w-[150px]">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className={cn(
                              "uppercase tracking-widest",
                              task.status === "Completed" ? "text-green-600" :
                              task.status === "In Progress" ? "text-blue-600" : "text-slate-500"
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
                        <div className="flex -space-x-2">
                          {task.assignedTo && task.assignedTo.length > 0 ? (
                            task.assignedTo.map((user, i) => (
                              <div key={i} className="w-12 h-12 rounded-xl bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-600 font-mono shadow-sm" title={user.name}>
                                {(user.name || user)}
                              </div>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Unassigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canCreate && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingTask(task);
                                  setNewTask({
                                    title: task.title,
                                    project: (task.projectId || (task.project as any)?.id || task.project as any)?._id || (task.project as any)?.id || task.project as string,
                                    assignedTo: task.assignedTo?.map((s: any) => s._id || s.id || s) || [],
                                    priority: task.priority || "Medium",
                                    startDate: task.startDate || new Date().toISOString().split('T')[0],
                                    endDate: task.endDate || new Date().toISOString().split('T')[0],
                                  });
                                  setIsModalOpen(true);
                                }}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTaskToDelete(task.id);
                                  setIsConfirmOpen(true);
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn("h-8 w-8 rounded-lg transition-all", expandedTaskId === task.id ? "bg-indigo-600 text-white" : "text-slate-400")}
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedTaskId(expandedTaskId === task.id ? null : task.id);
                            }}
                          >
                            <ArrowRight className={cn("w-4 h-4 transition-transform", expandedTaskId === task.id && "rotate-90")} />
                          </Button>
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
                                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Update Task Status</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {["Pending", "In Progress", "Completed"].map((status) => (
                                      <Button
                                        key={status}
                                        variant={task.status === status ? "primary" : "outline"}
                                        size="sm"
                                        className="rounded-xl text-[10px] h-8"
                                        onClick={() => updateOfficeTaskStatus(task.id, status as any)}
                                      >
                                        {status}
                                      </Button>
                                    ))}
                                  </div>
                                </>
                              )}
                              <div className="pt-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Notes</h4>
                                {false ? (
                                  <p className="text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100 shadow-sm italic">
                                    {task.notes || "No notes available for this task."}
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    <textarea
                                      className="w-full text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                                      rows={3}
                                      placeholder="Add notes..."
                                      value={noteValues[task.id] ?? (task.notes || "")}
                                      onChange={(e) => setNoteValues(prev => ({ ...prev, [task.id]: e.target.value }))}
                                    />
                                    <Button
                                      size="sm"
                                      className="rounded-xl text-[10px] h-8 bg-indigo-600 hover:bg-indigo-500"
                                      onClick={async () => {
                                        await updateOfficeTask(task.id, { notes: noteValues[task.id] ?? task.notes });
                                        setNoteValues(prev => {
                                          const next = { ...prev };
                                          delete next[task.id];
                                          return next;
                                        });
                                        toast.success("Notes saved successfully");
                                      }}
                                    >
                                      Save Notes
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Design Photos</h4>
                              <TaskImageUpload
                                  taskId={task.id}
                                  type="Office"
                                  existingImages={task.images}
                                  canDelete={canDeleteImages(task)}
                                  onUploadComplete={() => {
                                    refreshTasks();
                                    toast.success("Photos updated successfully");
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
