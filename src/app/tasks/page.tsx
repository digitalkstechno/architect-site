"use client";

import {
  Plus, Search, CircleCheck, CircleAlert, Clock, ChevronRight
} from "lucide-react";
import { cn, toTitleCase } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { DataTable, Column } from "@/components/ui/DataTable";
import { useAuth } from "@/lib/auth-context";
import { useTasks } from "@/lib/tasks-store";
import { StatusBadge } from "@/components/ui/StatusBadge";

const statusOptions = ["Pending", "In Progress", "Completed"];

export default function TasksPage() {
  const { user } = useAuth();
  const { tasks, isHydrated, fetchTasks } = useTasks();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const combinedTasks = useMemo(() => {
    return tasks.map(t => ({
      id: t.id,
      name: t.name,
      project: t.project || "Unknown",
      stage: t.stage || t.category || "-",
      assignee: t.assignee || "Unassigned",
      status: t.status || "Pending",
      type: t.type || "Office",
      deadline: t.deadline,
    }));
  }, [tasks]);
  const canEdit = user?.role === "architect" || user?.role === "director" || user?.role === "supervisor";

  const columns: Column<any>[] = [
    {
      header: "TASK NAME",
      render: (task) => (
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{task.name}</p>
            <span className={cn(
              "text-[8px] font-black px-1.5 py-0.5 rounded border  tracking-widest",
              task.type === "Office" ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-orange-50 text-orange-600 border-orange-100"
            )}>
              {task.type}
            </span>
          </div>
          <p className="text-[10px] font-medium text-slate-500 tracking-wide">{toTitleCase(task.project)} • {toTitleCase(task.stage)}</p>
        </div>
      ),
    },
    {
      header: "ASSIGNEE",
      render: (task) => (
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">
            {task.assignee?.split(",")[0]?.split(" ").map((n: string) => n[0]).join("") || "U"}
          </div>
          <p className="text-sm font-medium text-slate-700">{task.assignee}</p>
        </div>
      ),
    },
    {
      header: "STATUS",
      render: (task) => (
        canEdit ? (
          <select
            value={task.status}
            onChange={() => {}}
            className={cn(
              "px-3 py-1.5 rounded-full text-[10px] font-bold border  tracking-wider cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500",
              task.status === "Completed" ? "bg-green-50 text-green-700 border-green-200" :
              task.status === "In Progress" || task.status === "On Track" ? "bg-blue-50 text-blue-700 border-blue-200" :
              "bg-slate-100 text-slate-600 border-slate-200"
            )}
          >
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            {task.type === "Site" && ["Critical", "Delayed", "On Track"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        ) : (
          <StatusBadge status={task.status} />
        )
      ),
    },
    {
      header: "DEADLINE",
      render: (task) => (
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Clock className="w-4 h-4" />
          {task.deadline || "No deadline"}
        </div>
      ),
    },
  ];

  const filteredTasks = combinedTasks.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.assignee.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
          </div>
        </div>

        <Card className="overflow-hidden p-0">
          <DataTable columns={columns} data={filteredTasks} />
        </Card>
      </div>
    </>
  );
}

// function StatusBadge({ status }: { status: string }) {
//   const styles: Record<string, string> = {
//     "Pending": "bg-slate-100 text-slate-600 border-slate-200",
//     "In Progress": "bg-blue-50 text-blue-600 border-blue-100",
//     "Completed": "bg-green-50 text-green-600 border-green-100",
//   };
//   const icons: Record<string, typeof CircleAlert> = {
//     "Pending": CircleAlert,
//     "In Progress": Clock,
//     "Completed": CircleCheck,
//   };
//   const Icon = icons[status] || CircleAlert;
//   return (
//     <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border uppercase tracking-wider shadow-sm", styles[status])}>
//       <Icon className="w-3.5 h-3.5" />
//       {status}
//     </span>
//   );
// }
