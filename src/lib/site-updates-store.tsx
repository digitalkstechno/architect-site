"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { siteUpdates as seedUpdates } from "@/lib/dummy-data";

export type SiteUpdate = {
  id: string;
  projectId?: string;
  project: string;
  update: string;
  date: string;
  progress: number;
  photos: number;
  stage?: string;
  addedBy?: string;
  createdAt?: string;
};

type CreateUpdateInput = Omit<SiteUpdate, "id" | "date" | "photos" | "createdAt"> & {
  id?: string;
  date?: string;
  photos?: number;
};

type SiteUpdatesContextType = {
  updates: SiteUpdate[];
  isHydrated: boolean;
  getUpdatesByProjectId: (projectId: string) => SiteUpdate[];
  createUpdate: (input: CreateUpdateInput) => SiteUpdate;
  deleteUpdate: (id: string) => void;
};

const STORAGE_KEY = "archisite_site_updates";
const SiteUpdatesContext = createContext<SiteUpdatesContextType | undefined>(undefined);

function safeParse<T>(raw: string | null): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function normalizeSeed(): SiteUpdate[] {
  return (seedUpdates as unknown as any[]).map((u) => ({
    ...u,
    id: String(u.id),
    createdAt: new Date().toISOString(),
  }));
}

export function SiteUpdatesProvider({ children }: { children: React.ReactNode }) {
  const [updates, setUpdates] = useState<SiteUpdate[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = safeParse<SiteUpdate[]>(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved)) {
      setUpdates(saved);
    } else {
      const seeded = normalizeSeed();
      setUpdates(seeded);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updates));
  }, [updates, isHydrated]);

  const api = useMemo<SiteUpdatesContextType>(() => {
    const getUpdatesByProjectId = (projectId: string) => updates.filter((u) => u.projectId === projectId);

    const createUpdate = (input: CreateUpdateInput): SiteUpdate => {
      const created: SiteUpdate = {
        id: input.id ?? String(Date.now()),
        projectId: input.projectId,
        project: input.project,
        update: input.update,
        date: input.date ?? new Date().toISOString().split("T")[0],
        progress: input.progress ?? 0,
        photos: input.photos ?? 0,
        stage: input.stage,
        addedBy: input.addedBy,
        createdAt: new Date().toISOString(),
      };
      setUpdates((prev) => [created, ...prev]);
      return created;
    };

    const deleteUpdate = (id: string) => setUpdates((prev) => prev.filter((u) => u.id !== id));

    return { updates, isHydrated, getUpdatesByProjectId, createUpdate, deleteUpdate };
  }, [updates, isHydrated]);

  return <SiteUpdatesContext.Provider value={api}>{children}</SiteUpdatesContext.Provider>;
}

export function useSiteUpdates() {
  const ctx = useContext(SiteUpdatesContext);
  if (!ctx) throw new Error("useSiteUpdates must be used within a SiteUpdatesProvider");
  return ctx;
}

