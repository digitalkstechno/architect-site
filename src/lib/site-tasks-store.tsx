"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { siteTaskService } from "@/services/siteTask.service";

export type SiteTaskStatus = "Pending" | "In Progress" | "Completed" | "Critical" | "Delayed" | "On Track";
export type SiteTaskCategory = "Civil" | "Interior";

export type SiteTask = {
  id: string;
  title: string;
  projectId?: string;
  project: string;
  category: SiteTaskCategory;
  assignedTo: any[];
  status: SiteTaskStatus;
  progress: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
  images?: string[];
  createdAt?: string;
};

type CreateSiteTaskInput = Omit<SiteTask, "id" | "createdAt"> & {
  id?: string;
};

type SiteTasksContextType = {
  siteTasks: SiteTask[];
  isHydrated: boolean;
  refreshTasks: () => Promise<void>;
  getSiteTasksByProjectId: (projectId: string) => SiteTask[];
  createSiteTask: (input: CreateSiteTaskInput) => SiteTask | Promise<SiteTask>;
  updateSiteTask: (id: string, patch: Partial<SiteTask>) => void;
  updateSiteTaskStatus: (id: string, status: SiteTaskStatus) => void;
  deleteSiteTask: (id: string) => void;
};

const SiteTasksContext = createContext<SiteTasksContextType | undefined>(undefined);

export function SiteTasksProvider({ children }: { children: React.ReactNode }) {
  const [siteTasks, setSiteTasks] = useState<SiteTask[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const fetchTasks = async () => {
    try {
      const data = (await siteTaskService.getAllTasks()) as any;
      if (data && data.length >= 0) {
        const mappedTasks = data.map((t: any) => ({
          ...t,
          id: t._id,
        }));
        setSiteTasks(mappedTasks);
      }
    } catch (error) {
      console.error("Failed to fetch site tasks from backend", error);
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

  const api = useMemo<SiteTasksContextType>(() => {
    const getSiteTasksByProjectId = (projectId: string) => siteTasks.filter((t) => t.projectId === projectId || (t.project as any)?._id === projectId);

    const createSiteTask = async (input: CreateSiteTaskInput): Promise<SiteTask> => {
      try {
        const payload = {
          title: input.title,
          project: input.projectId,
          category: input.category,
          assignedTo: input.assignedTo,
          status: input.status || "On Track",
          progress: input.progress || 0,
          startDate: input.startDate,
          endDate: input.endDate,
          notes: input.notes,
        };
        const data = (await siteTaskService.createTask(payload)) as any;
        const created: SiteTask = {
          ...data,
          id: data._id,
        };
        await fetchTasks();
        window.dispatchEvent(new Event("refreshProjects"));
        return created;
      } catch (error) {
        console.error("Failed to create site task on backend", error);
        const created: SiteTask = {
          id: input.id ?? String(Date.now()),
          title: input.title,
          projectId: input.projectId,
          project: input.project,
          category: input.category,
          assignedTo: input.assignedTo ?? [],
          status: input.status ?? "On Track",
          progress: input.progress ?? 0,
          startDate: input.startDate,
          endDate: input.endDate,
          notes: input.notes,
          createdAt: new Date().toISOString(),
        };
        setSiteTasks((prev) => [created, ...prev]);
        return created;
      }
    };

    const updateSiteTask = async (id: string, patch: Partial<SiteTask>) => {
      try {
        const payload: any = { ...patch };
        if (patch.projectId) {
          payload.project = patch.projectId;
        }
        await siteTaskService.updateTask(id, payload);
        await fetchTasks();
        window.dispatchEvent(new Event("refreshProjects"));
      } catch (error) {
        console.error("Failed to update site task on backend", error);
        setSiteTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      }
    };

    const updateSiteTaskStatus = (id: string, status: SiteTaskStatus) => {
      let progress = 0;
      if (status === "Completed") progress = 100;
      else if (status === "In Progress" || status === "On Track") progress = 50;
      else if (status === "Critical" || status === "Delayed") progress = 25; // Or 0, but let's give a bit of progress if it's already started. Actually let's do 25.
      updateSiteTask(id, { status, progress });
    };

    const deleteSiteTask = async (id: string) => {
      try {
        await siteTaskService.deleteTask(id);
        await fetchTasks();
        window.dispatchEvent(new Event("refreshProjects"));
      } catch (error) {
        console.error("Failed to delete site task on backend", error);
        setSiteTasks((prev) => prev.filter((t) => t.id !== id));
      }
    };

    return { siteTasks, isHydrated, refreshTasks: fetchTasks, getSiteTasksByProjectId, createSiteTask, updateSiteTask, updateSiteTaskStatus, deleteSiteTask };
  }, [siteTasks, isHydrated]);

  return <SiteTasksContext.Provider value={api}>{children}</SiteTasksContext.Provider>;
}

export function useSiteTasks() {
  const ctx = useContext(SiteTasksContext);
  if (!ctx) throw new Error("useSiteTasks must be used within a SiteTasksProvider");
  return ctx;
}
