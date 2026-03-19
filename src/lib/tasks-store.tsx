"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { tasks as seedTasks } from "@/lib/dummy-data";

export type TaskStatus = "Pending" | "In Progress" | "Completed";

export type Task = {
  id: string;
  name: string;
  projectId?: string;
  project: string;
  stage: string;
  worker: string;
  deadline: string;
  status: TaskStatus;
  createdAt?: string;
};

type CreateTaskInput = Omit<Task, "id" | "status" | "createdAt"> & {
  id?: string;
  status?: TaskStatus;
};

type TasksContextType = {
  tasks: Task[];
  isHydrated: boolean;
  getTasksByProjectId: (projectId: string) => Task[];
  createTask: (input: CreateTaskInput) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
};

const STORAGE_KEY = "archisite_tasks";
const TasksContext = createContext<TasksContextType | undefined>(undefined);

function safeParse<T>(raw: string | null): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function normalizeSeed(): Task[] {
  return (seedTasks as unknown as any[]).map((t) => ({
    ...t,
    id: String(t.id),
    status: (t.status ?? "Pending") as TaskStatus,
    createdAt: new Date().toISOString(),
  }));
}

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = safeParse<Task[]>(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved)) {
      setTasks(saved);
    } else {
      const seeded = normalizeSeed();
      setTasks(seeded);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, isHydrated]);

  const api = useMemo<TasksContextType>(() => {
    const getTasksByProjectId = (projectId: string) => tasks.filter((t) => t.projectId === projectId);

    const createTask = (input: CreateTaskInput): Task => {
      const created: Task = {
        id: input.id ?? String(Date.now()),
        name: input.name,
        projectId: input.projectId,
        project: input.project,
        stage: input.stage,
        worker: input.worker,
        deadline: input.deadline,
        status: input.status ?? "Pending",
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [created, ...prev]);
      return created;
    };

    const updateTask = (id: string, patch: Partial<Task>) => {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    };

    const updateTaskStatus = (id: string, status: TaskStatus) => updateTask(id, { status });

    const deleteTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

    return { tasks, isHydrated, getTasksByProjectId, createTask, updateTask, updateTaskStatus, deleteTask };
  }, [tasks, isHydrated]);

  return <TasksContext.Provider value={api}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within a TasksProvider");
  return ctx;
}

