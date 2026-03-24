"use client";

import { tasks as initialTasks } from "@/lib/dummy-data";
import {
  Plus, Search, Filter, CircleCheck, CircleAlert, Clock, MoreVertical, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { useAuth } from "@/lib/auth-context";
import { API_BASE_URL } from "@/lib/api-config";
import { useTasks } from "@/lib/tasks-store";
import { useProjects } from "@/lib/projects-store";
import { toast } from "react-toastify";

export default function TasksPage() {
  const { user } = useAuth();
  const { tasks, createTask, updateTaskStatus, isHydrated } = useTasks();
  const { projects } = useProjects();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTask, setNewTask] = useState({ name: "", projectId: "", workerId: "", deadline: "" });
  const [workers, setWorkers] = useState<any[]>([]);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch(`${API_BASE_URL}/worker`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setWorkers(data.Workers || data.data || []);
      } catch (err) {
        console.error("Fetch workers error:", err);
      }
    };
    fetchWorkers();
  }, []);

  const canEdit = user?.role === "architect" || user?.role === "supervisor";

  const filteredTasks = tasks.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.worker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateStatus = async (id: string, status: any) => {
    try {
      await updateTaskStatus(id, status);
      toast.success("Task updated!");
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.name.trim()) return;
    
    try {
      const proj = projects.find(p => p.id === newTask.projectId);
      const wrk = workers.find(w => w._id === newTask.workerId);

      await createTask({
        name: newTask.name,
        projectId: newTask.projectId,
        project: proj?.name || "",
        workerId: newTask.workerId,
        worker: wrk?.userName || "",
        deadline: newTask.deadline,
        stage: "General" // Simplified
      });

      setNewTask({ name: "", projectId: "", workerId: "", deadline: "" });
      setIsAddModalOpen(false);
      toast.success("Task created!");
    } catch (err) {
      toast.error("Failed to create task");
    }
  };

  return (
    <>
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Task Tracker</h2>
            <p className="text-sm font-medium text-slate-500 hidden sm:block">Monitor and manage all active construction tasks</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <Input
                placeholder="Filter tasks..."
                icon={Search}
                className="w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {canEdit && (
              <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">New Task</span>
              </Button>
            )}
          </div>
        </div>

        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Name</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Assigned Worker</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id} className="group">
                  <TableCell>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{task.name}</p>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{task.project}</p>
                  </TableCell>
                  <TableCell>
                    <span className="px-2.5 py-1 bg-slate-100 text-[10px] font-bold text-slate-500 rounded uppercase tracking-wider">
                      {task.stage}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">
                        {task.worker.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{task.worker}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <Clock className="w-4 h-4" />
                      {task.deadline}
                    </div>
                  </TableCell>
                  <TableCell>
                    {canEdit || task.workerId === user?.id ? (
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value as any)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[10px] font-bold border uppercase tracking-wider cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500",
                          task.status === "Completed" ? "bg-green-50 text-green-700 border-green-200" :
                          task.status === "In Progress" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          "bg-slate-100 text-slate-600 border-slate-200"
                        )}
                      >
                        {["Pending", "In Progress", "Completed"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <StatusBadge status={task.status} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Task">
        <form onSubmit={handleAdd} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Task Name</label>
            <Input placeholder="e.g., Foundation Inspection" value={newTask.name} onChange={e => setNewTask(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Project</label>
              <select 
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newTask.projectId}
                onChange={e => setNewTask({ ...newTask, projectId: e.target.value })}
              >
                <option value="">Select Project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Assign Worker</label>
              <select 
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newTask.workerId}
                onChange={e => setNewTask({ ...newTask, workerId: e.target.value })}
              >
                <option value="">Select Worker</option>
                {workers.map(w => <option key={w._id} value={w._id}>{w.userName}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Deadline</label>
            <Input type="date" value={newTask.deadline} onChange={e => setNewTask(f => ({ ...f, deadline: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} type="button">Cancel</Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Pending": "bg-slate-100 text-slate-600 border-slate-200",
    "In Progress": "bg-blue-50 text-blue-600 border-blue-100",
    "Completed": "bg-green-50 text-green-600 border-green-100",
  };
  const icons: Record<string, typeof CircleAlert> = {
    "Pending": CircleAlert,
    "In Progress": Clock,
    "Completed": CircleCheck,
  };
  const Icon = icons[status] || CircleAlert;
  return (
    <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border uppercase tracking-wider shadow-sm", styles[status])}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}
