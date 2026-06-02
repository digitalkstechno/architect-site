"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { officeTaskService } from "@/services/officeTask.service";

export type OfficeTaskStatus = "Pending" | "In Progress" | "Completed";
export type OfficeTaskCategory = "Civil" | "Interior";

export type OfficeTask = {
  id: string;
  title: string;
  projectId?: string;
  project: string;
  category: OfficeTaskCategory;
  assignedTo: any[];
  status: OfficeTaskStatus;
  progress: number;
  startDate?: string;
  endDate?: string;
  priority?: string;
  notes?: string;
  images?: string[];
  createdAt?: string;
};

type CreateOfficeTaskInput = Omit<OfficeTask, "id" | "createdAt"> & {
  id?: string;
};

type OfficeTasksContextType = {
  officeTasks: OfficeTask[];
  isHydrated: boolean;
  refreshTasks: () => Promise<void>;
  getOfficeTasksByProjectId: (projectId: string) => OfficeTask[];
  createOfficeTask: (input: CreateOfficeTaskInput) => OfficeTask | Promise<OfficeTask>;
  updateOfficeTask: (id: string, patch: Partial<OfficeTask>) => void;
  updateOfficeTaskStatus: (id: string, status: OfficeTaskStatus) => void;
  deleteOfficeTask: (id: string) => void;
};

const OfficeTasksContext = createContext<OfficeTasksContextType | undefined>(undefined);

export function OfficeTasksProvider({ children }: { children: React.ReactNode }) {
  const [officeTasks, setOfficeTasks] = useState<OfficeTask[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const fetchTasks = async () => {
    try {
      const data = (await officeTaskService.getAllTasks()) as any;
      if (data && data.length >= 0) {
        const mappedTasks = data.map((t: any) => ({
          ...t,
          id: t._id,
        }));
        setOfficeTasks(mappedTasks);
      }
    } catch (error) {
      console.error("Failed to fetch office tasks from backend", error);
    } finally {
      setIsHydrated(true);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchTasks();
    else setIsHydrated(true);
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      const token = localStorage.getItem("token");
      if (token) fetchTasks();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const api = useMemo<OfficeTasksContextType>(() => {
    const getOfficeTasksByProjectId = (projectId: string) => officeTasks.filter((t) => t.projectId === projectId || (t.project as any)?._id === projectId);

    const createOfficeTask = async (input: CreateOfficeTaskInput): Promise<OfficeTask> => {
      try {
        const payload = {
          title: input.title,
          project: input.projectId,
          category: input.category,
          assignedTo: input.assignedTo,
          priority: input.priority || "Medium",
          status: input.status || "Pending",
          progress: input.progress || 0,
          startDate: input.startDate,
          endDate: input.endDate,
          notes: input.notes,
        };
        const data = (await officeTaskService.createTask(payload)) as any;
        const created: OfficeTask = {
          ...data,
          id: data._id,
        };
        await fetchTasks();
        window.dispatchEvent(new Event("refreshProjects"));
        return created;
      } catch (error) {
        console.error("Failed to create office task on backend", error);
        const created: OfficeTask = {
          id: input.id ?? String(Date.now()),
          title: input.title,
          projectId: input.projectId,
          project: input.project,
          category: input.category,
          assignedTo: input.assignedTo ?? [],
          status: input.status ?? "Pending",
          progress: input.progress ?? 0,
          startDate: input.startDate,
          endDate: input.endDate,
          priority: input.priority,
          notes: input.notes,
          createdAt: new Date().toISOString(),
        };
        setOfficeTasks((prev) => [created, ...prev]);
        return created;
      }
    };

    const updateOfficeTask = async (id: string, patch: Partial<OfficeTask>) => {
      try {
        const payload: any = { ...patch };
        if (patch.projectId) {
          payload.project = patch.projectId;
        }
        await officeTaskService.updateTask(id, payload);
        await fetchTasks();
        window.dispatchEvent(new Event("refreshProjects"));
      } catch (error) {
        console.error("Failed to update office task on backend", error);
        setOfficeTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      }
    };

    const updateOfficeTaskStatus = (id: string, status: OfficeTaskStatus) => {
      let progress = 0;
      if (status === "Completed") progress = 100;
      else if (status === "In Progress") progress = 50;
      updateOfficeTask(id, { status, progress });
    };

    const deleteOfficeTask = async (id: string) => {
      try {
        await officeTaskService.deleteTask(id);
        await fetchTasks();
        window.dispatchEvent(new Event("refreshProjects"));
      } catch (error) {
        console.error("Failed to delete office task on backend", error);
        setOfficeTasks((prev) => prev.filter((t) => t.id !== id));
      }
    };

    return { officeTasks, isHydrated, refreshTasks: fetchTasks, getOfficeTasksByProjectId, createOfficeTask, updateOfficeTask, updateOfficeTaskStatus, deleteOfficeTask };
  }, [officeTasks, isHydrated]);

  return <OfficeTasksContext.Provider value={api}>{children}</OfficeTasksContext.Provider>;
}

export function useOfficeTasks() {
  const ctx = useContext(OfficeTasksContext);
  if (!ctx) throw new Error("useOfficeTasks must be used within a OfficeTasksProvider");
  return ctx;
}
