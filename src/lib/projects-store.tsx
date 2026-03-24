"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { projects as seedProjects } from "@/lib/dummy-data";
import { useAuth } from "./auth-context";
import { API_BASE_URL } from "./api-config";

export type StageStatus = "Pending" | "In Progress" | "Completed";
export type LifecycleStatus = "Pending" | "In Progress" | "Completed";

export type ProjectStage = {
  name: string;
  status: StageStatus;
};

export type ProjectLifecyclePhase = {
  name: string;
  status: LifecycleStatus;
};

export interface Project {
  id: string;
  name: string;
  client: string;
  clientId?: string;
  location: string;
  startDate: string;
  expectedCompletion: string;
  status: "Planned" | "In Progress" | "On Hold" | "Completed";
  progress: number;
  budget: string;
  received: string;
  pending: string;
  totalReceived?: number;
  totalExpense?: number;
  balance?: number;
  supervisorId?: string;
  workerIds?: string[];
  phase?: string;
  lifecycle?: ProjectLifecyclePhase[];
  stages?: ProjectStage[];
}

type CreateProjectInput = Omit<
  Project,
  "id" | "progress" | "received" | "pending" | "status" | "phase"
> & {
  id?: string;
  progress?: number;
  received?: string;
  pending?: string;
  status?: string;
  phase?: string;
};

type ProjectsContextType = {
  projects: Project[];
  isHydrated: boolean;
  fetchProjects: () => Promise<void>;
  getProjectById: (id: string) => Project | undefined;
  createProject: (input: CreateProjectInput) => Promise<Project>;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  updateStageStatus: (projectId: string, stageName: string, status: StageStatus) => void;
  updateLifecycleStatus: (projectId: string, phaseName: string, status: LifecycleStatus) => void;
};

const STORAGE_KEY = "archisite_projects";
const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

function safeParse<T>(raw: string | null): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function normalizeSeed(): Project[] {
  return (seedProjects as unknown as Project[]).map((p) => ({
    ...p,
    workerIds: p.workerIds ?? [],
    stages: p.stages ?? [],
  }));
}

function computeProgressFromStages(stages: ProjectStage[]): number {
  if (!stages || stages.length === 0) return 0;
  const completed = stages.filter((s) => s.status === "Completed").length;
  return Math.round((completed / stages.length) * 100);
}

function computeStatusFromProgress(progress: number): Project["status"] {
  if (progress <= 0) return "Planned";
  if (progress >= 100) return "Completed";
  return "In Progress";
}

function computePhaseFromLifecycle(lifecycle?: ProjectLifecyclePhase[]): string | undefined {
  if (!lifecycle || lifecycle.length === 0) return undefined;
  const inProgress = lifecycle.find((p) => p.status === "In Progress");
  return inProgress?.name ?? lifecycle[lifecycle.length - 1]?.name;
}

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setProjects([]);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/project`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch projects");

      const payload = await res.json();
      const backendProjects = payload.projects || payload.data || [];

      // Filter projects for client role
      const roleName = typeof user?.role === "object" ? (user.role as any).roleName : "";
      const isClient = roleName === "TENANT_Client" || roleName === "Client";

      const mapped: Project[] = backendProjects
        .filter((p: any) => {
          if (!isClient) return true;
          const pClientId = p.clientId?._id || p.clientId;
          return pClientId === user?.id;
        })
        .map((p: any) => ({
          id: p._id,
          name: p.projectName || "Untitled Project",
          client: p.clientId?.clientName || "Unknown Client",
          clientId: p.clientId?._id || p.clientId,
          location: p.siteAddress || "—",
          startDate: p.startDate ? new Date(p.startDate).toISOString().split("T")[0] : "",
          expectedCompletion: p.expectedEndDate ? new Date(p.expectedEndDate).toISOString().split("T")[0] : "",
          status: p.status === "PLANNING" ? "Planned" : p.status === "ACTIVE" ? "In Progress" : p.status === "ON_HOLD" ? "On Hold" : p.status === "COMPLETED" ? "Completed" : "Planned",
          progress: 0,
          budget: `₹${(p.budget || 0).toLocaleString()}`,
          received: `₹${(p.totalReceived || 0).toLocaleString()}`,
          pending: `₹${((p.budget || 0) - (p.totalReceived || 0)).toLocaleString()}`,
          totalReceived: p.totalReceived || 0,
          totalExpense: p.totalExpense || 0,
          balance: p.balance || 0,
          stages: [],
        }));

      setProjects(mapped);
    } catch (err) {
      console.error("Fetch projects error:", err);
    } finally {
      setIsHydrated(true);
    }
  }, [user]);

  // Hydrate from backend when user changes
  useEffect(() => {
    fetchProjects();
  }, [user, fetchProjects]);

  const api = useMemo<ProjectsContextType>(() => {
    const getProjectById = (id: string) => projects.find((p) => p.id === id);

    const createProject = async (input: CreateProjectInput): Promise<Project> => {
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("No token");

      const budgetValue = Number(input.budget.replace(/[^0-9.-]+/g, ""));
      const res = await fetch(`${API_BASE_URL}/project`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectName: input.name,
          clientId: input.clientId,
          siteAddress: input.location,
          startDate: input.startDate,
          expectedEndDate: input.expectedCompletion,
          budget: budgetValue,
          status: "PLANNING",
        }),
      });

      if (!res.ok) throw new Error("Failed to create project");
      const payload = await res.json();
      const p = payload.data || payload;

      const created: Project = {
        id: p._id,
        name: p.projectName,
        client: input.client,
        clientId: p.clientId,
        location: p.siteAddress,
        startDate: p.startDate,
        expectedCompletion: p.expectedEndDate,
        status: "Planned",
        progress: 0,
        budget: input.budget,
        received: "$0",
        pending: input.budget,
        stages: [],
      };

      setProjects((prev) => [...prev, created]);
      await fetchProjects();
      return created;
    };

    const updateProject = async (id: string, patch: Partial<Project>) => {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const body: any = {};
      if (patch.name) body.projectName = patch.name;
      if (patch.location) body.siteAddress = patch.location;
      if (patch.status) {
        body.status = patch.status === "Planned" ? "PLANNING" : patch.status === "In Progress" ? "ACTIVE" : patch.status === "On Hold" ? "ON_HOLD" : "COMPLETED";
      }
      if (patch.budget) body.budget = Number(patch.budget.replace(/[^0-9.-]+/g, ""));

      await fetch(`${API_BASE_URL}/project/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      await fetchProjects();
    };

    const deleteProject = async (id: string) => {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      await fetch(`${API_BASE_URL}/project/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProjects((prev) => prev.filter((p) => p.id !== id));
    };

    const updateStageStatus = (projectId: string, stageName: string, status: StageStatus) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          const stages = (p.stages ?? []).map((s) => (s.name === stageName ? { ...s, status } : s));
          const progress = computeProgressFromStages(stages);
          const statusText = computeStatusFromProgress(progress);
          return { ...p, stages, progress, status: statusText };
        })
      );
    };

    const updateLifecycleStatus = (projectId: string, phaseName: string, status: LifecycleStatus) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          const lifecycle = (p.lifecycle ?? []).map((ph) => (ph.name === phaseName ? { ...ph, status } : ph));
          const phase = computePhaseFromLifecycle(lifecycle) ?? p.phase;
          return { ...p, lifecycle, phase };
        })
      );
    };

    return {
      projects,
      isHydrated,
      fetchProjects,
      getProjectById,
      createProject,
      updateProject,
      deleteProject,
      updateStageStatus,
      updateLifecycleStatus,
    };
  }, [projects, isHydrated, fetchProjects]);

  return <ProjectsContext.Provider value={api}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within a ProjectsProvider");
  return ctx;
}

