"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { taskService } from "@/services/task.service";

export type TaskStatus = "Pending" | "In Progress" | "Completed" | "Critical" | "Delayed" | "On Track";

export type Task = {
  id: string;
  name: string;
  projectId: string;
  project: string;
  type: "Site" | "Office";
  category?: string;
  assignee: string;
  status: TaskStatus;
  deadline?: string;
  progress?: number;
  stage?: string;
  officeTeam?: string;
  officeStatus?: TaskStatus;
  siteTeam?: string;
  siteStatus?: TaskStatus;
  createdAt?: string;
};

type TasksContextType = {
  tasks: Task[];
  isHydrated: boolean;
  getTasksByProjectId: (projectId: string) => Task[];
  fetchTasks: () => Promise<void>;
};

const TasksContext = createContext<TasksContextType | undefined>(undefined);

function mapTask(t: any): Task {
  const assignedNames = Array.isArray(t.assignedTo)
    ? t.assignedTo.map((u: any) => u?.name || u).filter(Boolean).join(", ")
    : t.assignedTo?.name || t.assignedTo || "Unassigned";

  return {
    id: t._id || t.id,
    name: t.title || t.name || "",
    projectId: t.project?._id || t.project || "",
    project: t.project?.name || t.project || "",
    type: t.type || "Office",
    category: t.category,
    assignee: assignedNames || "Unassigned",
    status: t.status || "Pending",
    deadline: t.deadline || t.endDate,
    progress: t.progress,
    stage: t.stage,
    officeTeam: t.type === "Office" ? assignedNames : undefined,
    officeStatus: t.type === "Office" ? t.status : undefined,
    siteTeam: t.type === "Site" ? assignedNames : undefined,
    siteStatus: t.type === "Site" ? t.status : undefined,
    createdAt: t.createdAt,
  };
}

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await taskService.getAllTasks() as any[];
      if (Array.isArray(data)) {
        setTasks(data.map(mapTask));
      }
    } catch (error) {
      console.error("Failed to fetch tasks from backend", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getTasksByProjectId = useCallback(
    (projectId: string) => tasks.filter((t) => t.projectId === projectId),
    [tasks]
  );

  return (
    <TasksContext.Provider value={{ tasks, isHydrated, getTasksByProjectId, fetchTasks }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within a TasksProvider");
  return ctx;
}
