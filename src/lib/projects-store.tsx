"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { projects as seedProjects } from "@/lib/dummy-data";

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

export type Project = {
  id: string;
  name: string;
  client: string;
  clientId?: string;
  location: string;
  startDate: string;
  expectedCompletion: string;
  status: string;
  progress: number;
  budget: string;
  received: string;
  pending: string;
  supervisorId?: string;
  workerIds?: string[];
  phase?: string;
  lifecycle?: ProjectLifecyclePhase[];
  stages: ProjectStage[];
};

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
  getProjectById: (id: string) => Project | undefined;
  createProject: (input: CreateProjectInput) => Project;
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

function computeStatusFromProgress(progress: number): string {
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage or seed
  useEffect(() => {
    const saved = safeParse<Project[]>(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved) && saved.length > 0) {
      setProjects(saved);
    } else {
      const seeded = normalizeSeed();
      setProjects(seeded);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    }
    setIsHydrated(true);
  }, []);

  // Persist updates
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects, isHydrated]);

  const api = useMemo<ProjectsContextType>(() => {
    const getProjectById = (id: string) => projects.find((p) => p.id === id);

    const createProject = (input: CreateProjectInput): Project => {
      const id = input.id ?? String(Date.now());
      const status = input.status ?? "Planned";
      const progress = input.progress ?? 0;
      const received = input.received ?? "$0";
      const pending = input.pending ?? input.budget ?? "$0";
      const phase = input.phase ?? "Pre-Design";

      const created: Project = {
        id,
        name: input.name,
        client: input.client,
        clientId: input.clientId,
        location: input.location,
        startDate: input.startDate,
        expectedCompletion: input.expectedCompletion,
        status,
        progress,
        budget: input.budget,
        received,
        pending,
        supervisorId: input.supervisorId,
        workerIds: input.workerIds ?? [],
        phase,
        lifecycle: input.lifecycle ?? [],
        stages: input.stages ?? [],
      };

      setProjects((prev) => [...prev, created]);
      return created;
    };

    const updateProject = (id: string, patch: Partial<Project>) => {
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    };

    const deleteProject = (id: string) => {
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
      getProjectById,
      createProject,
      updateProject,
      deleteProject,
      updateStageStatus,
      updateLifecycleStatus,
    };
  }, [projects, isHydrated]);

  return <ProjectsContext.Provider value={api}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within a ProjectsProvider");
  return ctx;
}

