"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { tasks as seedTasks } from "@/lib/dummy-data";
import { useAuth } from "./auth-context";

export type TaskStatus = "Pending" | "In Progress" | "Completed";

export type Task = {
  id: string;
  name: string;
  projectId?: string;
  project: string;
  stage: string;
  worker: string;
  workerId?: string;
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
  fetchTasks: () => Promise<void>;
  getTasksByProjectId: (projectId: string) => Task[];
  createTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
};

const STORAGE_KEY = "archisite_tasks";
const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      if (!token) {
        setTasks([]);
        return;
      }

      const res = await fetch("http://localhost:9000/architecture/task", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Failed to fetch tasks");

      const payload = await res.json();
      const backendTasks = payload.Tasks || payload.data || [];

      const mapped: Task[] = backendTasks.map((t: any) => ({
        id: t._id,
        name: t.taskName || t.name,
        projectId: t.projectId?._id || t.projectId,
        project: t.projectId?.projectName || "Unknown Project",
        stage: t.stageId?.stageName || t.stage || "—",
        worker: t.workerId?.userName || t.worker || "Unassigned",
        workerId: t.workerId?._id || t.workerId,
        deadline: t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : t.deadline || "",
        status: t.status === "COMPLETED" ? "Completed" : t.status === "IN_PROGRESS" ? "In Progress" : "Pending",
        createdAt: t.createdAt,
      }));

      setTasks(mapped);
    } catch (err) {
      console.error("Fetch tasks error:", err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (token) fetchTasks();
  }, [user, token, fetchTasks]);

  const api = useMemo<TasksContextType>(() => {
    const getTasksByProjectId = (projectId: string) => tasks.filter((t) => t.projectId === projectId);

    const createTask = async (input: CreateTaskInput): Promise<Task> => {
      if (!token) throw new Error("No token");

      const res = await fetch("http://localhost:9000/architecture/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          taskName: input.name,
          projectId: input.projectId,
          workerId: input.workerId,
          dueDate: input.deadline,
          status: "PENDING"
        })
      });

      if (!res.ok) throw new Error("Failed to create task");
      const payload = await res.json();
      const t = payload.data || payload;

      const created: Task = {
        id: t._id,
        name: t.taskName,
        projectId: t.projectId,
        project: input.project,
        stage: input.stage,
        worker: input.worker,
        workerId: t.workerId,
        deadline: input.deadline,
        status: "Pending",
        createdAt: t.createdAt,
      };
      setTasks((prev) => [created, ...prev]);
      return created;
    };

    const updateTask = async (id: string, patch: Partial<Task>) => {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const body: any = {};
      if (patch.name) body.taskName = patch.name;
      if (patch.status) body.status = patch.status === "Completed" ? "COMPLETED" : patch.status === "In Progress" ? "IN_PROGRESS" : "PENDING";
      if (patch.deadline) body.dueDate = patch.deadline;

      await fetch(`http://localhost:9000/architecture/task/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      await fetchTasks();
    };

    const updateTaskStatus = (id: string, status: TaskStatus) => updateTask(id, { status });

    const deleteTask = async (id: string) => {
      if (!token) return;

      await fetch(`http://localhost:9000/architecture/task/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      setTasks((prev) => prev.filter((t) => t.id !== id));
    };

    return { tasks, isHydrated, fetchTasks, getTasksByProjectId, createTask, updateTask, updateTaskStatus, deleteTask };
  }, [tasks, isHydrated, fetchTasks]);

  return <TasksContext.Provider value={api}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within a TasksProvider");
  return ctx;
}

