"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { siteUpdateService } from "@/services/site-update.service";

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
  createUpdate: (input: CreateUpdateInput) => Promise<SiteUpdate>;
  deleteUpdate: (id: string) => Promise<void>;
  fetchUpdates: () => Promise<void>;
};

const SiteUpdatesContext = createContext<SiteUpdatesContextType | undefined>(undefined);

export function SiteUpdatesProvider({ children }: { children: React.ReactNode }) {
  const [updates, setUpdates] = useState<SiteUpdate[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const fetchUpdates = async () => {
    try {
      const data = (await siteUpdateService.getAllUpdates()) as any;
      if (data && data.length >= 0) {
        const mappedUpdates = data.map((u: any) => ({
          ...u,
          id: u._id,
        }));
        setUpdates(mappedUpdates);
      }
    } catch (error) {
      console.error("Failed to fetch site updates from backend", error);
    } finally {
      setIsHydrated(true);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const api = useMemo<SiteUpdatesContextType>(() => {
    const getUpdatesByProjectId = (projectId: string) => updates.filter((u) => u.projectId === projectId || (u.project as any)?._id === projectId);

    const createUpdate = async (input: CreateUpdateInput): Promise<SiteUpdate> => {
      try {
        const payload = {
          project: input.projectId || input.project,
          update: input.update,
          progress: input.progress,
          stage: input.stage,
        };
        const data = await siteUpdateService.createUpdate(payload) as any;
        await fetchUpdates();
        return { ...data, id: data._id } as SiteUpdate;
      } catch (error) {
        console.error("Failed to create update on backend", error);
        throw error;
      }
    };

    const deleteUpdate = async (id: string) => {
      try {
        await siteUpdateService.deleteUpdate(id);
        await fetchUpdates();
      } catch (error) {
        console.error("Failed to delete update on backend", error);
        setUpdates((prev) => prev.filter((u) => u.id !== id));
      }
    };

    return { updates, isHydrated, getUpdatesByProjectId, createUpdate, deleteUpdate, fetchUpdates };
  }, [updates, isHydrated]);

  return <SiteUpdatesContext.Provider value={api}>{children}</SiteUpdatesContext.Provider>;
}

export function useSiteUpdates() {
  const ctx = useContext(SiteUpdatesContext);
  if (!ctx) throw new Error("useSiteUpdates must be used within a SiteUpdatesProvider");
  return ctx;
}

