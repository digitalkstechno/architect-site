"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { siteUpdates as seedUpdates } from "@/lib/dummy-data";
import { useAuth } from "./auth-context";
import { API_BASE_URL } from "./api-config";

export type SiteUpdate = {
  id: string;
  projectId?: string;
  project: string;
  update: string;
  date: string;
  progress: number;
  photos: number;
  images?: string[];
  stage?: string;
  addedBy?: string;
  createdAt?: string;
};

type CreateUpdateInput = {
  projectId: string;
  project: string;
  update: string;
  stageId?: string;
  stage?: string;
  progress?: number;
  images?: File[];
};

type SiteUpdatesContextType = {
  updates: SiteUpdate[];
  isLoading: boolean;
  fetchUpdates: () => Promise<void>;
  getUpdatesByProjectId: (projectId: string) => SiteUpdate[];
  createUpdate: (input: CreateUpdateInput) => Promise<void>;
  deleteUpdate: (id: string) => Promise<void>;
};

const SiteUpdatesContext = createContext<SiteUpdatesContextType | undefined>(undefined);

export function SiteUpdatesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<SiteUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUpdates = useCallback(async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setUpdates([]);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/projectupdate`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Failed to fetch updates");

      const payload = await res.json();
      const backendUpdates = payload.data || payload || [];

      const mapped: SiteUpdate[] = backendUpdates.map((u: any) => ({
        id: u._id,
        projectId: u.projectId?._id || u.projectId,
        project: u.projectId?.projectName || "Unknown Project",
        update: u.description || "No description",
        date: u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : "",
        progress: 0, // Backend projectupdate doesn't have progress yet
        photos: u.images?.length || 0,
        images: u.images || [],
        stage: u.stageId?.stageName || "—",
        addedBy: u.createdBy?.userName || "Unknown",
        createdAt: u.createdAt,
      }));

      setUpdates(mapped);
    } catch (err) {
      console.error("Fetch updates error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpdates();
  }, [user, fetchUpdates]);

  const api = useMemo<SiteUpdatesContextType>(() => {
    const getUpdatesByProjectId = (projectId: string) => updates.filter((u) => u.projectId === projectId);

    const createUpdate = async (input: CreateUpdateInput): Promise<void> => {
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("No token");

      const formData = new FormData();
      formData.append("projectId", input.projectId);
      formData.append("description", input.update);
      if (input.stageId) formData.append("stageId", input.stageId);
      if (input.images) {
        input.images.forEach((img) => formData.append("images", img));
      }

      const res = await fetch(`${API_BASE_URL}/projectupdate`, {
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error("Failed to create update");
      await fetchUpdates();
    };

    const deleteUpdate = async (id: string) => {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      await fetch(`${API_BASE_URL}/projectupdate/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchUpdates();
    };

    return { updates, isLoading, fetchUpdates, getUpdatesByProjectId, createUpdate, deleteUpdate };
  }, [updates, isLoading, fetchUpdates]);

  return <SiteUpdatesContext.Provider value={api}>{children}</SiteUpdatesContext.Provider>;
}

export function useSiteUpdates() {
  const ctx = useContext(SiteUpdatesContext);
  if (!ctx) throw new Error("useSiteUpdates must be used within a SiteUpdatesProvider");
  return ctx;
}

